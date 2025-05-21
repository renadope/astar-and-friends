export type SimpleGridProps = {
    grid: number[][]
}

export default function SimpleGrid({grid}: SimpleGridProps) {
    return (
        <div className={'flex flex-col gap-2'}>
            {grid.map((row, r) => (
                    <div key={r} className={'flex gap-x-0.5'}>
                        {row.map((value, c) => {
                            const key = `${r},${c}`
                            return (
                                <div key={key}
                                     style={{
                                         height: `${gridCellSize}rem`,
                                         width: `${gridCellSize}rem`,
                                         backgroundColor: "#dff2fe"
                                     }}
                                     className={` rounded flex items-center justify-center shadow-sm border border-sky-300 `}>
                                    <p className="text-gray-800 font-medium">
                                        {value.toFixed(2)}</p>
                                </div>
                            )
                        })}
                    </div>
                )
            )}
        </div>
    )

}