export const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

export const toSentenceCase = (str: string) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) =>
      word.length > 0
        ? word[0].toUpperCase() + word.slice(1).toLowerCase()
        : '',
    )
    .join(' ');
};
