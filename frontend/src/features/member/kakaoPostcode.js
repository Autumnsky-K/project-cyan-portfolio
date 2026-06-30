const POSTCODE_SCRIPT_ID = 'kakao-postcode-script'
const POSTCODE_SCRIPT_SRC =
  'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

let postcodeScriptPromise = null

function getPostcodeConstructor() {
  return window.daum?.Postcode ?? window.kakao?.Postcode
}

function loadPostcodeScript() {
  if (getPostcodeConstructor()) {
    return Promise.resolve()
  }

  if (postcodeScriptPromise) {
    return postcodeScriptPromise
  }

  postcodeScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(POSTCODE_SCRIPT_ID)

    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = POSTCODE_SCRIPT_ID
    script.src = POSTCODE_SCRIPT_SRC
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })

  return postcodeScriptPromise
}

function formatAddress(data) {
  const baseAddress = data.roadAddress || data.jibunAddress || data.address || ''
  const extraAddressParts = []

  if (data.bname && /[동|로|가]$/g.test(data.bname)) {
    extraAddressParts.push(data.bname)
  }

  if (data.buildingName && data.apartment === 'Y') {
    extraAddressParts.push(data.buildingName)
  }

  const extraAddress = extraAddressParts.length > 0
    ? ` (${extraAddressParts.join(', ')})`
    : ''

  return [data.zonecode, `${baseAddress}${extraAddress}`]
    .filter(Boolean)
    .join(' ')
}

export async function openKakaoPostcode(onComplete) {
  await loadPostcodeScript()

  const Postcode = getPostcodeConstructor()

  if (!Postcode) {
    throw new Error('주소 검색 서비스를 불러오지 못했습니다.')
  }

  new Postcode({
    oncomplete(data) {
      onComplete(formatAddress(data))
    },
  }).open()
}
