import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 h-10 px-4 py-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Link>
      
      <div className="relative hidden h-full flex-col bg-neutral-100 dark:bg-neutral-900 p-10 text-white lg:flex border-r border-neutral-200 dark:border-neutral-800">
        <div className="absolute inset-0 bg-neutral-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Major Moments
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "This platform completely transformed how our sales team tracks their pipeline. 
              The bento dashboard design provides unprecedented visibility with zero clutter."
            </p>
            <footer className="text-sm">Alexey, РОП</footer>
          </blockquote>
        </div>
      </div>
      
      <div className="lg:p-8 flex items-center justify-center h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
