const URL_REGEX = /(https?:\/\/[^\s<]+)/g;
const NBSP = ' ';

export function linkify(text: string) {
  const isFullUrl = URL_REGEX.test(text) && text.trim().replace(URL_REGEX, '') === '';

  if (isFullUrl) {
    return <>{NBSP}<a href={text} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">{text}</a>{NBSP}</>;
  }

  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    URL_REGEX.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">{part}</a>
      : part,
  );
}
