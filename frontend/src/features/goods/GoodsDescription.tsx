function GoodsDescription({ sanitizedHtml }: { sanitizedHtml?: string | null }) {
  const descriptionHtml = sanitizedHtml?.trim()

  return (
    <section className="detail-description-summary" aria-labelledby="detail-description-heading">
      <h2 id="detail-description-heading">상품 소개</h2>
      {descriptionHtml ? (
        <div
          className="detail-description"
          // Goods descriptions are sanitized by the backend GoodsDescriptionSanitizer before storage.
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      ) : (
        <p>상품 소개가 준비 중입니다.</p>
      )}
    </section>
  )
}

export default GoodsDescription
