import { Moon } from "lucide-react";

export default function ThemeToggle(){

    return(

        <button

        className="

        h-12

        w-12

        rounded-full

        border

        border-white/10

        bg-white/10

        backdrop-blur-xl

        flex

        items-center

        justify-center

        hover:bg-white/20

        transition-all

        duration-500"

        >

            <Moon size={20}/>

        </button>

    )

}