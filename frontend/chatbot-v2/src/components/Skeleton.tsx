import classNames from "classnames";


/**
 * Props interface for Skeleton component
 */
interface SkeletonProps {
    /** Number of skeleton elements to render */
    times: number;
    /** CSS classes to apply to skeleton elements */
    className?: string;
}

/**
 * Skeleton loading component
 *
 * @param times - Number of skeleton elements to display
 * @param className - Optional CSS classes for styling
 *
 */
function Skeleton({ times, className }: SkeletonProps) {
  const outerClassNames = classNames(
    "relative",
    "overflow-hidden",
    "bg-gray-200",
    "rounded",
    "mb-2.5",
    className,
  );
  const innerClassNames = classNames(
    "animate-shimmer",
    "absolute",
    "inset-0",
    "-translate-x-full",
    "bg-gradient-to-r",
    "from-gray-200",
    "via-white",
    "to-gray-200",
  );

  const boxes = Array(times)
    .fill(0)
    .map((_, i) => {
      return (
        <div key={i} className={outerClassNames}>
          <div className={innerClassNames} />
        </div>
      );
    });

  return boxes;
}

export default Skeleton;
