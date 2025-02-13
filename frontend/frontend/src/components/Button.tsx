export const Button = ( {onClick, children}:{onClick: () => void, children:React.ReactNode}) => {
    return (
        <button className="bg-green-600 hover:bg-green-700 active:bg-green-500 px-4 py-2 rounded-md max-w-40 text-white font-sans font-bold " onClick={onClick}>{children}</button>
    )
}