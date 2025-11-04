export const Button = ({ onClick, children, isDisabled = false }: { onClick: () => void, children: React.ReactNode, isDisabled?: boolean }) => {
    return (

        <button className={`${isDisabled ? "bg-gray-500 hover:bg-gray-600 active:bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 active:bg-green-500"} px-4 py-2 rounded-md max-w-40 text-white font-sans font-bold`} onClick={onClick} disabled={isDisabled}>{children}</button>
        
    )
}