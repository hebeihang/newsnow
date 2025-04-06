export function Footer() {
  return (
    <span>
      <span>NewsNow © 2024 </span>
      <a href={Author.url} target="_blank" rel="noreferrer noopener">
        {Author.name}
      </a>
      <span> | Based on work by </span>
      <a href="https://github.com/ourongxing" target="_blank" rel="noreferrer noopener">
        ourongxing
      </a>
    </span>
  )
}
