import {type Algorithm, DEFAULT_ALGORITHMS} from "~/presets/algorithm-gh-weight-configs";

type AlgorithmSelectorProps = {
    onAlgorithmChange: (algorithm: Algorithm) => void;
    currentAlgorithm?: string | null;
    className?: string;
    algorithms?: Algorithm[];
}

export default function AlgorithmSelector({
                                      onAlgorithmChange,
                                      currentAlgorithm = null,
                                      className = "",
                                      algorithms = DEFAULT_ALGORITHMS
                                  }: AlgorithmSelectorProps) {

    function getButtonClasses(algorithm: Algorithm): string {
        const baseClasses = "px-3 py-1.5 text-xs font-medium rounded-md transition-colors";
        const isSelected = currentAlgorithm === algorithm.id;

        if (algorithm.variant === 'primary') {
            return `${baseClasses} ${
                isSelected
                    ? 'bg-purple-200 text-purple-800'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
            }`;
        }

        return `${baseClasses} ${
            isSelected
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`
    }

    return (
        <div className={`border-t border-gray-200 pt-4 ${className}`}>
            <div className="flex gap-2 justify-center flex-wrap">
                {algorithms.map((algorithm) => (
                    <button
                        key={algorithm.id}
                        onClick={() => onAlgorithmChange(algorithm)}
                        className={getButtonClasses(algorithm)}
                        title={algorithm.title}
                    >
                        {algorithm.label}
                    </button>
                ))}
            </div>
        </div>
    )
}