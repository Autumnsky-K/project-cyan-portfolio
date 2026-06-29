package com.projectcyan.ai;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/admin/ai/behavior-lab/local-oauth")
public class AdminAiOAuthLocalController {

	private static final String TOKEN_KEY_MASK = "0.0000000000000000000000000000000";
	private static final String OAUTH_HOST = "127.0.0.1";
	private static final int OAUTH_PORT = 8001;

	@PostMapping("/open-key-shell")
	public Map<String, Object> openKeyShell(HttpServletRequest request) {
		if (!isLoopback(request.getRemoteAddr())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Local OAuth helper is only available from loopback.");
		}

		Path workspaceRoot = resolveWorkspaceRoot();
		Path serverScript = workspaceRoot.resolve("individual").resolve("oauth_llm_chat_server.py");
		if (!Files.isRegularFile(serverScript)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "OAuth server script not found: " + serverScript);
		}

		Path runtimeRoot = workspaceRoot.resolve(".oauth-llm-chat-runtime");
		Path helperPath = runtimeRoot.resolve("oauth_key_restart_helper.ps1");
		try {
			Files.createDirectories(runtimeRoot);
			Files.writeString(helperPath, buildHelperScript(workspaceRoot, serverScript), StandardCharsets.UTF_8);
			startVisiblePowerShell(helperPath, workspaceRoot);
		} catch (IOException ex) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to open OAuth key PowerShell.", ex);
		}

		return Map.of(
				"ok", true,
				"helperPath", helperPath.toString(),
				"message", "PowerShell key prompt opened.",
				"oauthApi", "http://" + OAUTH_HOST + ":" + OAUTH_PORT);
	}

	private static boolean isLoopback(String remoteAddr) {
		try {
			return InetAddress.getByName(remoteAddr).isLoopbackAddress();
		} catch (Exception ex) {
			return false;
		}
	}

	private static Path resolveWorkspaceRoot() {
		Path userDir = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
		Path current = userDir;
		while (current != null) {
			if (Files.isDirectory(current.resolve("project-cyan")) && Files.isDirectory(current.resolve("individual"))) {
				return current;
			}
			if ("project-cyan".equalsIgnoreCase(String.valueOf(current.getFileName())) && current.getParent() != null) {
				return current.getParent();
			}
			current = current.getParent();
		}
		return userDir;
	}

	private static void startVisiblePowerShell(Path helperPath, Path workspaceRoot) throws IOException {
		String command = "Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',"
				+ psSingleQuote(helperPath.toString()) + ") -WorkingDirectory " + psSingleQuote(workspaceRoot.toString());
		new ProcessBuilder("powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command)
				.directory(workspaceRoot.toFile())
				.start();
	}

	private static String buildHelperScript(Path workspaceRoot, Path serverScript) {
		String serverArgs = "@("
				+ psSingleQuote(serverScript.toString())
				+ ", '--host', " + psSingleQuote(OAUTH_HOST)
				+ ", '--port', '" + OAUTH_PORT + "')";
		String healthUrl = "http://" + OAUTH_HOST + ":" + OAUTH_PORT + "/api/health";
		return """
$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = [Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [Text.UTF8Encoding]::new()
Set-Location -LiteralPath %s

$mask = %s
$serverArgs = %s
$healthUrl = %s

while ($true) {
  $bstr = [IntPtr]::Zero
  $plain = $null
  try {
    Clear-Host
    Write-Host ''
    Write-Host 'Enter OAuth token protection key.' -ForegroundColor Cyan
    Write-Host ('Required format: ' + $mask) -ForegroundColor DarkCyan
    Write-Host 'Your input will not be shown on screen.' -ForegroundColor DarkGray
    Write-Host ''

    $secure = Read-Host 'OAUTH_TOKEN_DIGIT_KEY' -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    if ($plain.Length -ne $mask.Length) {
      throw ('Invalid key length. expected=' + $mask.Length + ', actual=' + $plain.Length)
    }
    for ($i = 0; $i -lt $mask.Length; $i++) {
      $m = $mask[$i]
      $c = $plain[$i]
      if ($m -eq '.') {
        if ($c -ne '.') {
          throw ('Invalid dot position: ' + $i)
        }
      } elseif (-not [char]::IsDigit($c)) {
        throw ('Invalid digit position: ' + $i)
      }
    }

    $env:OAUTH_TOKEN_DIGIT_KEY = $plain
    $env:OAUTH_TOKEN_DIGIT_KEY_MASK = $mask
    Write-Host ''
    Write-Host 'Key accepted. Restarting OAuth server on port 8001.' -ForegroundColor Green

    $connections = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue
    $owners = @($connections | Where-Object { $_.OwningProcess -and $_.OwningProcess -ne 0 } | Select-Object -ExpandProperty OwningProcess -Unique)
    foreach ($owner in $owners) {
      Stop-Process -Id $owner -Force -ErrorAction SilentlyContinue
    }

    Start-Sleep -Milliseconds 700
    $process = Start-Process -FilePath 'python' -ArgumentList $serverArgs -WorkingDirectory %s -WindowStyle Hidden -PassThru

    $started = $false
    for ($try = 0; $try -lt 20; $try++) {
      Start-Sleep -Milliseconds 250
      try {
        $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 1
        if ($health.ok) {
          $started = $true
          break
        }
      } catch {}
    }
    if (-not $started) {
      throw 'OAuth server did not pass health check after restart.'
    }

    Write-Host ('OAuth server started in background. PID=' + $process.Id) -ForegroundColor Green
    Write-Host 'Closing this key prompt in 1 second.' -ForegroundColor DarkGray
    Start-Sleep -Seconds 1
    exit 0
  } catch {
    Write-Host ''
    Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red
    Write-Host 'The OAuth server was not restarted with this key.' -ForegroundColor Yellow
    Write-Host ''
    $choice = Read-Host 'Press Enter to retry, or type q to close'
    if ($choice -match '^(q|quit|exit)$') {
      exit 1
    }
  } finally {
    if ($bstr -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
    $plain = $null
  }
}
""".formatted(
				psSingleQuote(workspaceRoot.toString()),
				psSingleQuote(TOKEN_KEY_MASK),
				serverArgs,
				psSingleQuote(healthUrl),
				psSingleQuote(workspaceRoot.toString()));
	}

	private static String psSingleQuote(String value) {
		return "'" + value.replace("'", "''") + "'";
	}
}
