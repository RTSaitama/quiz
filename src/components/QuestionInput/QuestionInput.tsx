import styles from './QuestionInput.module.scss';

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function QuestionInput({
  value,
  onChange,
  placeholder = 'Введи свою відповідь...',
}: QuestionInputProps) {
  return (
    <textarea
      className={styles.textarea}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}