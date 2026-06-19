param(
    [string]$SourceRoot = "$PSScriptRoot\..\..\character_thumbnail_images",
    [string]$OutputRoot = "$PSScriptRoot\..\backend\src\main\resources\static\demo-images\thumbnails",
    [string]$ManifestPath = "$PSScriptRoot\..\backend\src\main\resources\static\demo-images\image-classification.json"
)

Add-Type -AssemblyName System.Drawing

$targetWidth = 640
$targetHeight = 480
$targetRatio = $targetWidth / $targetHeight
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object MimeType -eq "image/jpeg"
$encoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$encoderParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
    [System.Drawing.Imaging.Encoder]::Quality,
    [long]88
)

$thumbnailOverrides = @{
    "genshin_impact/furina" = "01.jpg"
    "genshin_impact/mualani" = "02.jpg"
    "genshin_impact/navia" = "06.jpg"
    "genshin_impact/nahida" = "07.jpg"
    "genshin_impact/ganyu" = "10.jpg"
    "genshin_impact/yae_miko" = "06.jpg"
    "wuthering_waves/jinhsi" = "03.jpg"
    "wuthering_waves/the_shorekeeper" = "02.jpg"
    "wuthering_waves/phoebe" = "04.jpg"
    "wuthering_waves/encore" = "01.jpg"
    "wuthering_waves/zhezhi" = "05.jpg"
    "wuthering_waves/cartethyia" = "01.jpg"
    "neverness_to_everness/mint" = "04.jpg"
    "neverness_to_everness/aurelia" = "01.jpg"
    "neverness_to_everness/hotori" = "01.jpg"
    "neverness_to_everness/nanally" = "04.jpg"
    "neverness_to_everness/lacrimosa" = "07.jpg"
    "neverness_to_everness/fadia" = "02.jpg"
    "zenless_zone_zero/astra_yao" = "04.jpg"
    "zenless_zone_zero/belle" = "02.jpg"
    "zenless_zone_zero/nicole_demara" = "03.jpg"
    "zenless_zone_zero/vivian_banshee" = "06.jpg"
    "zenless_zone_zero/qingyi" = "01.jpg"
    "zenless_zone_zero/alice_thymefield" = "03.jpg"
}

function Get-ImageInfo {
    param([System.IO.FileInfo]$File)

    $image = [System.Drawing.Image]::FromFile($File.FullName)
    try {
        [pscustomobject]@{
            File = $File
            Width = $image.Width
            Height = $image.Height
            Ratio = $image.Width / $image.Height
            Area = $image.Width * $image.Height
        }
    }
    finally {
        $image.Dispose()
    }
}

function Save-CenteredThumbnail {
    param(
        [string]$SourcePath,
        [string]$DestinationPath
    )

    $source = [System.Drawing.Image]::FromFile($SourcePath)
    try {
        $scale = [Math]::Max($targetWidth / $source.Width, $targetHeight / $source.Height)
        $drawWidth = [int][Math]::Ceiling($source.Width * $scale)
        $drawHeight = [int][Math]::Ceiling($source.Height * $scale)
        $drawX = [int][Math]::Floor(($targetWidth - $drawWidth) / 2)
        $drawY = [int][Math]::Floor(($targetHeight - $drawHeight) / 2)

        $bitmap = [System.Drawing.Bitmap]::new($targetWidth, $targetHeight)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.Clear([System.Drawing.Color]::White)
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.DrawImage($source, $drawX, $drawY, $drawWidth, $drawHeight)
            }
            finally {
                $graphics.Dispose()
            }

            New-Item -ItemType Directory -Force -Path (Split-Path $DestinationPath) | Out-Null
            $bitmap.Save($DestinationPath, $jpegCodec, $encoderParameters)
        }
        finally {
            $bitmap.Dispose()
        }
    }
    finally {
        $source.Dispose()
    }
}

$classifications = foreach ($gameDirectory in Get-ChildItem -Directory $SourceRoot) {
    foreach ($characterDirectory in Get-ChildItem -Directory $gameDirectory.FullName) {
        $images = Get-ChildItem -File $characterDirectory.FullName -Filter "*.jpg" |
            ForEach-Object { Get-ImageInfo $_ }

        if (-not $images) {
            continue
        }

        $classificationKey = "$($gameDirectory.Name)/$($characterDirectory.Name)"
        $overrideFile = $thumbnailOverrides[$classificationKey]

        if ($overrideFile) {
            $thumbnail = $images | Where-Object { $_.File.Name -eq $overrideFile } | Select-Object -First 1
        }
        else {
            $thumbnail = $images |
                Sort-Object @{
                    Expression = {
                        $ratioDistance = [Math]::Abs([Math]::Log($_.Ratio / $targetRatio))
                        $portraitPenalty = if ($_.Ratio -lt 0.8) { 0.35 } else { 0 }
                        $smallPenalty = if ($_.Width -lt 320) { 0.2 } else { 0 }
                        $ratioDistance + $portraitPenalty + $smallPenalty
                    }
                }, @{ Expression = { -$_.Area } } |
                Select-Object -First 1
        }

        $bodyCandidates = @($images |
            Where-Object { $_.Ratio -lt 0.9 -and $_.File.Name -ne $thumbnail.File.Name } |
            Sort-Object Area -Descending |
            Select-Object -First 3)

        if ($bodyCandidates.Count -eq 0) {
            $bodyCandidates = @($images | Sort-Object Area -Descending | Select-Object -First 3)
        }

        $thumbnailPath = Join-Path $OutputRoot "$($gameDirectory.Name)\$($characterDirectory.Name).jpg"
        Save-CenteredThumbnail $thumbnail.File.FullName $thumbnailPath

        [pscustomobject]@{
            game = $gameDirectory.Name
            character = $characterDirectory.Name
            thumbnail = [pscustomobject]@{
                sourceFile = $thumbnail.File.Name
                sourceWidth = $thumbnail.Width
                sourceHeight = $thumbnail.Height
                outputWidth = $targetWidth
                outputHeight = $targetHeight
                url = "/demo-images/thumbnails/$($gameDirectory.Name)/$($characterDirectory.Name).jpg"
            }
            bodyImages = @($bodyCandidates | ForEach-Object {
                [pscustomobject]@{
                    sourceFile = $_.File.Name
                    width = $_.Width
                    height = $_.Height
                }
            })
        }
    }
}

$classifications |
    ConvertTo-Json -Depth 6 |
    Set-Content -Encoding UTF8 $ManifestPath

Write-Output "Prepared $($classifications.Count) character thumbnails."
