import { useNavigate } from "react-router-dom";
import board from "../assets/board.png"
import { Button } from "../components/Button";
export const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="flex justify-center pt-4">
                <div className="flex justify-center gap-10">
                    <div className="img">
                        <img src={board} alt="" className="max-w-96"/>
                    </div>
                    <div className="text text-white flex flex-col gap-4">
                        <h1 className="font-sans text-3xl font-bold">Play Chess Online</h1>
                        <p className="text-lg">Play chess with millions of players around the world</p>
                        <Button onClick = {() => {
                            navigate("/game")
                        }}>Play Online</Button>
                    </div>
                </div>
        </div>
    )
}