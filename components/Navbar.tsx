"use client";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "./Button";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      dir="rtl"
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md fixed top-0 right-0 left-0 z-50 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* شعار الموقع */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <img src="" alt="" />
          {/* <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary-dark)] tracking-tight">
            عيادتك
          </h1> */}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-[var(--color-primary)] focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* روابط التنقل */}
        <ul
          className={`flex flex-col md:flex-row md:items-center md:space-x-8 rtl:space-x-reverse absolute md:static top-16 right-0 w-full md:w-auto bg-white dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent shadow-md md:shadow-none transition-all duration-300 ease-in-out ${
            isOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible md:visible md:opacity-100"
          }`}
        >
          <li className="text-zinc-700 dark:text-zinc-300 hover:text-[var(--color-primary-dark)] px-4 py-2 md:p-0 cursor-pointer transition">
            <Link href="/">الرئيسية</Link>
          </li>
          <li className="text-zinc-700 dark:text-zinc-300 hover:text-[var(--color-primary-dark)] px-4 py-2 md:p-0 cursor-pointer transition">
            <Link href="/about">عن العيادة</Link>
          </li>
          <li className="text-zinc-700 dark:text-zinc-300 hover:text-[var(--color-primary-dark)] px-4 py-2 md:p-0 cursor-pointer transition">
            <Link href="/services">الخدمات</Link>
          </li>
          <li className="text-zinc-700 dark:text-zinc-300 hover:text-[var(--color-primary-dark)] px-4 py-2 md:p-0 cursor-pointer transition">
            <Link href="/doctors">الأطباء</Link>
          </li>
          <li className="text-zinc-700 dark:text-zinc-300 hover:text-[var(--color-primary-dark)] px-4 py-2 md:p-0 cursor-pointer transition">
            <Link href="/contact">تواصل معنا</Link>
          </li>

          {/* زر تبديل الوضع */}
          <li className="px-4 py-2 md:p-0">
            <ThemeToggle />
          </li>

          {/* الأزرار */}
          <li>
            <Link href="/login">
              <Button title="تسجيل دخول" />
            </Link>
          </li>
          <li>
            <Link href="/joinUs">
              <Button title="انضم إلينا" />
            </Link>
          </li>

          {/* اللغة */}
          <select className="border-none text-sm text-black dark:text-white bg-transparent focus:outline-none mr-5">
            <option value="العربية">العربية</option>
            <option value="English">English</option>
          </select>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
