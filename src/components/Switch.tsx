interface Props {
  checked: boolean;
  onChange: () => void;
}

export default function Switch({ checked, onChange }: Props) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
        checked ? "bg-success" : "bg-gray-600"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}