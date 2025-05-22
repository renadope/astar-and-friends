import type {ComponentPropsWithoutRef} from "react";

type IconProps = React.ComponentPropsWithoutRef<'svg'>

export function PlayIcon({className, ...props}: IconProps) {
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        width="24"
        height="24"
        className={`${className}`}
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v18l15-9L5 3z"/>
    </svg>;
}

export function PauseIcon({className, ...props}: IconProps) {
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        width="24"
        height="24"
        className={`${className}`}
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h2v16h-2zM16 4h2v16h-2z"/>
    </svg>;
}

export function ForwardIcon({className, ...props}: ComponentPropsWithoutRef<'svg'>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
             className={className} fill="none"
             viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
    )
}
export function PreviousIcon({className, ...props}: ComponentPropsWithoutRef<'svg'>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
             className={className} fill="none"
             viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
    )
}
