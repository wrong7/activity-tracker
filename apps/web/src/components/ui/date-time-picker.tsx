"use client"

import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "react-day-picker/locale";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useState, useEffect, useMemo, useCallback } from "react"

interface DateTimePicker24hProps {
    defaultValue?: Date
    onChange?: (date: Date) => void
    placeholder?: string
}

export function DateTimePicker24h({ defaultValue, onChange, placeholder = "Select date and time" }: DateTimePicker24hProps) {
    const [date, setDate] = useState<Date>(() => defaultValue || new Date())
    const [isOpen, setIsOpen] = useState(false)

    // Sync with external changes
    useEffect(() => {
        if (defaultValue && defaultValue.getTime() !== date.getTime()) {
            setDate(new Date(defaultValue))
        }
    }, [defaultValue, date])

    // Memoize arrays to prevent recreation on every render
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
    const minutes = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), [])

    const handleDateSelect = useCallback((selectedDate: Date | undefined) => {
        if (selectedDate) {
            const newDate = new Date(selectedDate)
            newDate.setHours(date.getHours())
            newDate.setMinutes(date.getMinutes())
            setDate(newDate)
            onChange?.(newDate)
        }
    }, [date, onChange])

    const handleTimeChange = useCallback((type: "hour" | "minute", value: number) => {
        const newDate = new Date(date)

        if (type === "hour") {
            newDate.setHours(value)
        } else if (type === "minute") {
            newDate.setMinutes(value)
        }

        setDate(newDate)
        onChange?.(newDate)
    }, [date, onChange])

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "dd/MM/yyyy HH:mm")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        locale={es}
                    />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {hours.map((hour) => (
                                    <Button
                                        key={hour}
                                        size="icon"
                                        variant={date.getHours() === hour ? "default" : "ghost"}
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("hour", hour)}
                                    >
                                        {hour.toString().padStart(2, "0")}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {minutes.map((minute) => (
                                    <Button
                                        key={minute}
                                        size="icon"
                                        variant={date.getMinutes() === minute ? "default" : "ghost"}
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("minute", minute)}
                                    >
                                        {minute.toString().padStart(2, "0")}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
