import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function InteractiveCalendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            locale={id}
            showOutsideDays={showOutsideDays}
            className={cn("p-6 bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/40 border border-slate-100", className)}
            classNames={{
                root: "w-full h-full",
                months: "flex flex-col w-full h-full",
                month: "w-full h-full flex flex-col gap-4",
                caption: "flex justify-center pt-1 relative items-center mb-6",
                caption_label: "text-lg font-bold text-[#101D42] uppercase tracking-wider",
                nav: "space-x-1 flex items-center bg-slate-50 p-1 rounded-xl absolute right-0 top-0",
                nav_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-white rounded-lg transition-all text-slate-500"
                ),
                table: "w-full h-full border-collapse",
                head_row: "grid grid-cols-7 mb-2",
                head_cell: "text-slate-400 font-bold text-xs uppercase tracking-wider text-center py-2",
                row: "grid grid-cols-7 w-full mt-2 gap-2 flex-1",
                cell: "h-auto w-full aspect-square text-center p-0 relative focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-full w-full p-2 font-normal aria-selected:opacity-100 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all flex flex-col items-start justify-start gap-1 border border-transparent hover:border-blue-100"
                ),
                day_selected:
                    "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white shadow-md shadow-blue-200",
                day_today: "bg-slate-50 text-[#101D42] font-bold border-2 border-blue-100",
                day_outside:
                    "text-slate-300 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30",
                day_disabled: "text-slate-300 opacity-50",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
            }}
            {...props}
        />
    );
}
InteractiveCalendar.displayName = "InteractiveCalendar";

export { InteractiveCalendar };
