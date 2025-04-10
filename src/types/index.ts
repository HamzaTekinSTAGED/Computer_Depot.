import { MouseEventHandler } from "react";

export interface CustomButtonProps {
    title: string;
    containerStyles?: string;
    handleClick?: MouseEventHandler<HTMLButtonElement>;
    btnType?: "button" | "submit";
    textStyles?: string; 
    rightIcon?: string;
    isDisabled?: boolean;
}

export interface FormData {
    username: string;
    name: string;
    surname: string;
    email: string;
    password: string;
    confirmPassword?: string;
}




export interface Router {
  push: (path: string) => void;
}
