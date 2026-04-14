"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { enUS, ru } from "date-fns/locale";
import { CalendarIcon, ClockIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Locale = "ru" | "en";
type Theme = "light" | "dark";

type FormValues = {
  text: string;
  textarea: string;
  radio: string[];
  checkbox: string[];
  select: string[];
  selectMultiple: string[];
  date: string;
  datetime: string;
};

type FieldName = keyof FormValues;
type FieldState = Record<FieldName, { disabled: boolean; required: boolean }>;

const choiceOptions = [
  {
    id: "option-1",
    labels: { ru: "Вариант 1", en: "Option 1" },
  },
  {
    id: "option-2",
    labels: { ru: "Вариант 2", en: "Option 2" },
  },
  {
    id: "option-3",
    labels: { ru: "Вариант 3", en: "Option 3" },
  },
] as const;

const initialValues: FormValues = {
  text: "",
  textarea: "",
  radio: [],
  checkbox: [],
  select: [],
  selectMultiple: [],
  date: "",
  datetime: "",
};

const initialFieldState: FieldState = {
  text: { disabled: false, required: false },
  textarea: { disabled: false, required: false },
  radio: { disabled: false, required: false },
  checkbox: { disabled: false, required: false },
  select: { disabled: false, required: false },
  selectMultiple: { disabled: false, required: false },
  date: { disabled: false, required: false },
  datetime: { disabled: false, required: false },
};

const fieldOrder: FieldName[] = [
  "text",
  "textarea",
  "radio",
  "checkbox",
  "select",
  "selectMultiple",
  "date",
  "datetime",
];

const focusTargetIds: Record<FieldName, string> = {
  text: "text",
  textarea: "textarea",
  radio: "radio-option-1",
  checkbox: "checkbox-option-1",
  select: "select",
  selectMultiple: "selectMultiple",
  date: "date",
  datetime: "datetime",
};

const calendarLocales = {
  ru,
  en: enUS,
} as const;

const dateFormatLocales: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
};

const dictionary = {
  ru: {
    pageTitle: "Форма полей",
    pageDescription:
      "Проверьте ввод, выборы, локализацию, тему и состояния полей.",
    language: "Язык",
    theme: "Тема",
    light: "Светлая",
    dark: "Темная",
    disabled: "Отключено",
    required: "Обязательно",
    submit: "Отправить",
    selectPlaceholder: "Выберите вариант",
    selectMultipleHint: "Зажмите Ctrl или Shift, чтобы выбрать несколько.",
    datePlaceholder: "Выберите дату",
    datetimePlaceholder: "Выберите дату и время",
    time: "Время",
    requiredError: "Заполните обязательное поле.",
    consoleHint: "После отправки нормализованный объект появится в console.log.",
    fieldSettings: "Состояния",
    fields: {
      text: {
        label: "Текст",
        description: "Обычное текстовое поле.",
        placeholder: "Введите текст",
      },
      textarea: {
        label: "Многострочный текст",
        description: "Поле увеличивает высоту по содержимому.",
        placeholder: "Введите несколько строк",
      },
      radio: {
        label: "Радио",
        description: "Можно выбрать один вариант, значение хранится массивом ID.",
      },
      checkbox: {
        label: "Чекбоксы",
        description:
          "Можно выбрать несколько вариантов, значение хранится массивом ID.",
      },
      select: {
        label: "Список",
        description: "Один вариант, но итоговое значение все равно массив ID.",
      },
      selectMultiple: {
        label: "Множественный список",
        description: "Несколько вариантов, итоговое значение массив ID.",
      },
      date: {
        label: "Дата",
        description: "Простое поле выбора даты.",
      },
      datetime: {
        label: "Дата и время",
        description: "Простое поле выбора даты и времени.",
      },
    },
  },
  en: {
    pageTitle: "Form fields",
    pageDescription:
      "Check input, selections, localization, theme, and field states.",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    disabled: "Disabled",
    required: "Required",
    submit: "Submit",
    selectPlaceholder: "Choose an option",
    selectMultipleHint: "Hold Ctrl or Shift to choose several options.",
    datePlaceholder: "Choose a date",
    datetimePlaceholder: "Choose date and time",
    time: "Time",
    requiredError: "Fill in this required field.",
    consoleHint: "After submit, the normalized object appears in console.log.",
    fieldSettings: "States",
    fields: {
      text: {
        label: "Text",
        description: "Standard text input.",
        placeholder: "Enter text",
      },
      textarea: {
        label: "Textarea",
        description: "The field grows with its content.",
        placeholder: "Enter several lines",
      },
      radio: {
        label: "Radio",
        description: "Choose one option, stored as an array of IDs.",
      },
      checkbox: {
        label: "Checkboxes",
        description: "Choose multiple options, stored as an array of IDs.",
      },
      select: {
        label: "Select",
        description: "One option, still normalized to an array of IDs.",
      },
      selectMultiple: {
        label: "Select multiple",
        description: "Several options, normalized to an array of IDs.",
      },
      date: {
        label: "Date",
        description: "Simple date field.",
      },
      datetime: {
        label: "Date and time",
        description: "Simple date and time field.",
      },
    },
  },
} as const;

function isEmptyValue(value: FormValues[FieldName]) {
  return Array.isArray(value) ? value.length === 0 : value.trim().length === 0;
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function toDateValue(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

function getDatePart(value: string) {
  return value.split("T")[0] ?? "";
}

function getTimePart(value: string) {
  return value.includes("T") ? value.split("T")[1]?.slice(0, 5) ?? "" : "";
}

function combineDateTimeValue(datePart: string, timePart: string) {
  return datePart ? `${datePart}T${timePart || "00:00"}` : "";
}

function formatDisplayDate(value: string, locale: Locale) {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(dateFormatLocales[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDisplayDateTime(value: string, locale: Locale) {
  const datePart = getDatePart(value);
  const date = parseDateValue(datePart);

  if (!date) {
    return "";
  }

  const [hours = "00", minutes = "00"] = getTimePart(value).split(":");
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat(dateFormatLocales[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [theme, setTheme] = useState<Theme>("light");
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldState, setFieldState] = useState<FieldState>(initialFieldState);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datetimePickerOpen, setDatetimePickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLDivElement | null>>>({});

  const t = dictionary[locale];

  const normalizedValues = useMemo<FormValues>(
    () => ({
      ...values,
      radio: [...values.radio],
      checkbox: [...values.checkbox],
      select: [...values.select],
      selectMultiple: [...values.selectMultiple],
    }),
    [values],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [values.textarea]);

  function clearError(name: FieldName) {
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function updateTextValue(name: FieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    clearError(name);
  }

  function updateSingleChoice(name: "radio" | "select", id: string | null) {
    setValues((current) => ({ ...current, [name]: id ? [id] : [] }));
    clearError(name);
  }

  function updateCheckbox(id: string, checked: boolean) {
    setValues((current) => {
      const next = checked
        ? [...current.checkbox, id]
        : current.checkbox.filter((itemId) => itemId !== id);

      return { ...current, checkbox: next };
    });
    clearError("checkbox");
  }

  function updateSelectMultiple(selectedIds: string[] | null) {
    setValues((current) => ({
      ...current,
      selectMultiple: selectedIds ?? [],
    }));
    clearError("selectMultiple");
  }

  function updateDate(date: Date | undefined) {
    updateTextValue("date", toDateValue(date));
    setDatePickerOpen(false);
  }

  function updateDatetimeDate(date: Date | undefined) {
    const datePart = toDateValue(date);
    const timePart = getTimePart(values.datetime);

    updateTextValue("datetime", combineDateTimeValue(datePart, timePart));
  }

  function updateDatetimeTime(timePart: string) {
    const datePart = getDatePart(values.datetime) || toDateValue(new Date());

    updateTextValue("datetime", combineDateTimeValue(datePart, timePart));
  }

  function updateFieldState(
    field: FieldName,
    key: keyof FieldState[FieldName],
    checked: boolean,
  ) {
    if (key === "disabled" && checked) {
      if (field === "date") {
        setDatePickerOpen(false);
      }

      if (field === "datetime") {
        setDatetimePickerOpen(false);
      }
    }

    setFieldState((current) => ({
      ...current,
      [field]: {
        ...current[field],
        ...(key === "disabled"
          ? {
              disabled: checked,
              required: checked ? false : current[field].required,
            }
          : {
              required: current[field].disabled ? false : checked,
            }),
      },
    }));

    clearError(field);
  }

  function focusFirstInvalidField(field: FieldName) {
    fieldRefs.current[field]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.setTimeout(() => {
      document.getElementById(focusTargetIds[field])?.focus({
        preventScroll: true,
      });
    }, 350);
  }

  function validate() {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    let firstInvalidField: FieldName | null = null;

    fieldOrder.forEach((field) => {
      if (
        fieldState[field].required &&
        !fieldState[field].disabled &&
        isEmptyValue(values[field])
      ) {
        nextErrors[field] = t.requiredError;

        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    });

    setErrors(nextErrors);

    if (firstInvalidField) {
      const targetField = firstInvalidField;
      requestAnimationFrame(() => focusFirstInvalidField(targetField));
      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    console.log(normalizedValues);
  }

  function renderFieldStateControls(field: FieldName) {
    return (
      <div className="flex flex-wrap gap-3 text-sm" aria-label={t.fieldSettings}>
        <Field orientation="horizontal" className="w-auto gap-2">
          <Switch
            id={`${field}-disabled`}
            size="sm"
            aria-label={t.disabled}
            checked={fieldState[field].disabled}
            onCheckedChange={(checked) =>
              updateFieldState(field, "disabled", checked)
            }
          />
          <FieldLabel htmlFor={`${field}-disabled`} className="font-normal">
            {t.disabled}
          </FieldLabel>
        </Field>
        <Field orientation="horizontal" className="w-auto gap-2">
          <Switch
            id={`${field}-required`}
            size="sm"
            aria-label={t.required}
            checked={fieldState[field].required}
            disabled={fieldState[field].disabled}
            onCheckedChange={(checked) =>
              updateFieldState(field, "required", checked)
            }
          />
          <FieldLabel htmlFor={`${field}-required`} className="font-normal">
            {t.required}
          </FieldLabel>
        </Field>
      </div>
    );
  }

  function renderFieldHeader(field: FieldName) {
    const copy = t.fields[field];

    return (
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <FieldLabel htmlFor={field} className="text-base">
              {copy.label}
              {fieldState[field].required ? (
                <span aria-hidden="true" className="text-destructive">
                  {" "}
                  *
                </span>
              ) : null}
            </FieldLabel>
            <FieldDescription className="mt-1">
              {copy.description}
            </FieldDescription>
          </div>
          {renderFieldStateControls(field)}
        </div>
      </CardHeader>
    );
  }

  function fieldProps(field: FieldName) {
    return {
      disabled: fieldState[field].disabled,
      required: fieldState[field].required,
      "aria-invalid": Boolean(errors[field]),
      "aria-describedby": errors[field] ? `${field}-error` : undefined,
    };
  }

  const selectItems = [
    { label: t.selectPlaceholder, value: null },
    ...choiceOptions.map((option) => ({
      label: option.labels[locale],
      value: option.id,
    })),
  ];

  const selectedMultipleLabel =
    values.selectMultiple.length === 0
      ? t.selectPlaceholder
      : values.selectMultiple.length === 1
        ? choiceOptions.find((option) => option.id === values.selectMultiple[0])
            ?.labels[locale]
        : `${values.selectMultiple.length} ${t.fields.selectMultiple.label.toLowerCase()}`;
  const selectedDate = parseDateValue(values.date);
  const selectedDatetimeDate = parseDateValue(getDatePart(values.datetime));
  const selectedDatetimeTime = getTimePart(values.datetime);
  const dateButtonLabel =
    formatDisplayDate(values.date, locale) || t.datePlaceholder;
  const datetimeButtonLabel =
    formatDisplayDateTime(values.datetime, locale) || t.datetimePlaceholder;
  const calendarLocale = calendarLocales[locale];

  return (
    <main
      className={`min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <Card className="mb-8">
          <CardContent className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">
              {t.pageTitle}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {t.pageDescription}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="language">{t.language}</FieldLabel>
              <Select
                items={[
                  { label: "Русский", value: "ru" },
                  { label: "English", value: "en" },
                ]}
                value={locale}
                onValueChange={(value) => setLocale(value as Locale)}
              >
                <SelectTrigger id="language" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field orientation="horizontal" className="items-center">
              <FieldContent>
                <FieldLabel htmlFor="theme-switch">{t.theme}</FieldLabel>
                <FieldDescription>
                  {theme === "dark" ? t.dark : t.light}
                </FieldDescription>
              </FieldContent>
              <Switch
                id="theme-switch"
                aria-label={t.theme}
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </Field>
          </div>
          </CardContent>
        </Card>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
          <Card ref={(node) => { fieldRefs.current.text = node; }}>
            {renderFieldHeader("text")}
            <CardContent>
              <Field data-invalid={Boolean(errors.text)} data-disabled={fieldState.text.disabled}>
                <Input
                  id="text"
                  type="text"
                  value={values.text}
                  onChange={(event) => updateTextValue("text", event.target.value)}
                  placeholder={t.fields.text.placeholder}
                  {...fieldProps("text")}
                />
                <FieldError id="text-error">{errors.text}</FieldError>
              </Field>
            </CardContent>
          </Card>

          <Card ref={(node) => { fieldRefs.current.textarea = node; }}>
            {renderFieldHeader("textarea")}
            <CardContent>
              <Field data-invalid={Boolean(errors.textarea)} data-disabled={fieldState.textarea.disabled}>
                <Textarea
                  id="textarea"
                  ref={textareaRef}
                  value={values.textarea}
                  onChange={(event) =>
                    updateTextValue("textarea", event.target.value)
                  }
                  placeholder={t.fields.textarea.placeholder}
                  rows={3}
                  className="min-h-24 resize-none overflow-hidden"
                  {...fieldProps("textarea")}
                />
                <FieldError id="textarea-error">{errors.textarea}</FieldError>
              </Field>
            </CardContent>
          </Card>

          <Card ref={(node) => { fieldRefs.current.radio = node; }}>
            {renderFieldHeader("radio")}
            <CardContent>
              <FieldSet data-invalid={Boolean(errors.radio)} data-disabled={fieldState.radio.disabled}>
                <FieldLegend className="sr-only">{t.fields.radio.label}</FieldLegend>
                <RadioGroup
                  id="radio"
                  value={values.radio[0] ?? ""}
                  onValueChange={(id) => updateSingleChoice("radio", id)}
                  disabled={fieldState.radio.disabled}
                  aria-invalid={Boolean(errors.radio)}
                  aria-describedby={errors.radio ? "radio-error" : undefined}
                >
                  {choiceOptions.map((option) => (
                    <Field key={option.id} orientation="horizontal">
                      <RadioGroupItem value={option.id} id={`radio-${option.id}`} />
                      <FieldLabel htmlFor={`radio-${option.id}`} className="font-normal">
                        {option.labels[locale]}
                      </FieldLabel>
                    </Field>
                  ))}
                </RadioGroup>
                <FieldError id="radio-error">{errors.radio}</FieldError>
              </FieldSet>
            </CardContent>
          </Card>

          <Card ref={(node) => { fieldRefs.current.checkbox = node; }}>
            {renderFieldHeader("checkbox")}
            <CardContent>
              <FieldSet data-invalid={Boolean(errors.checkbox)} data-disabled={fieldState.checkbox.disabled}>
                <FieldLegend className="sr-only">{t.fields.checkbox.label}</FieldLegend>
                <FieldGroup className="gap-3">
                  {choiceOptions.map((option) => (
                    <Field key={option.id} orientation="horizontal">
                      <Checkbox
                        id={`checkbox-${option.id}`}
                        checked={values.checkbox.includes(option.id)}
                        onCheckedChange={(checked) =>
                          updateCheckbox(option.id, checked === true)
                        }
                        disabled={fieldState.checkbox.disabled}
                        aria-invalid={Boolean(errors.checkbox)}
                        aria-describedby={errors.checkbox ? "checkbox-error" : undefined}
                      />
                      <FieldLabel htmlFor={`checkbox-${option.id}`} className="font-normal">
                        {option.labels[locale]}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
                <FieldError id="checkbox-error">{errors.checkbox}</FieldError>
              </FieldSet>
            </CardContent>
          </Card>

          <Card ref={(node) => { fieldRefs.current.select = node; }}>
            {renderFieldHeader("select")}
            <CardContent>
              <Field data-invalid={Boolean(errors.select)} data-disabled={fieldState.select.disabled}>
                <Select
                  items={selectItems}
                  value={values.select[0] ?? null}
                  onValueChange={(id) => updateSingleChoice("select", id)}
                  disabled={fieldState.select.disabled}
                >
                  <SelectTrigger
                    id="select"
                    className="w-full"
                    aria-invalid={Boolean(errors.select)}
                    aria-describedby={errors.select ? "select-error" : undefined}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError id="select-error">{errors.select}</FieldError>
              </Field>
            </CardContent>
          </Card>

          <Card ref={(node) => { fieldRefs.current.selectMultiple = node; }}>
            {renderFieldHeader("selectMultiple")}
            <CardContent>
              <Field data-invalid={Boolean(errors.selectMultiple)} data-disabled={fieldState.selectMultiple.disabled}>
                <Select
                  items={choiceOptions.map((option) => ({
                    label: option.labels[locale],
                    value: option.id,
                  }))}
                  multiple
                  value={values.selectMultiple}
                  onValueChange={(ids) =>
                    updateSelectMultiple(ids as string[] | null)
                  }
                  disabled={fieldState.selectMultiple.disabled}
                >
                  <SelectTrigger
                    id="selectMultiple"
                    className="w-full"
                    aria-invalid={Boolean(errors.selectMultiple)}
                    aria-describedby={
                      errors.selectMultiple ? "selectMultiple-error" : undefined
                    }
                  >
                    <SelectValue>{() => selectedMultipleLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {choiceOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.labels[locale]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>{t.selectMultipleHint}</FieldDescription>
                <FieldError id="selectMultiple-error">{errors.selectMultiple}</FieldError>
              </Field>
            </CardContent>
          </Card>

          <Card ref={(node) => { fieldRefs.current.date = node; }}>
            {renderFieldHeader("date")}
            <CardContent>
              <Field data-invalid={Boolean(errors.date)} data-disabled={fieldState.date.disabled}>
                <Popover
                  open={datePickerOpen}
                  onOpenChange={(open) => setDatePickerOpen(open)}
                >
                  <PopoverTrigger
                    id="date"
                    type="button"
                    disabled={fieldState.date.disabled}
                    aria-invalid={Boolean(errors.date)}
                    aria-describedby={errors.date ? "date-error" : undefined}
                    aria-required={fieldState.date.required}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-start px-3 text-left font-normal",
                      !values.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="size-4" aria-hidden="true" />
                    <span>{dateButtonLabel}</span>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={updateDate}
                      locale={calendarLocale}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError id="date-error">{errors.date}</FieldError>
              </Field>
            </CardContent>
          </Card>

          <Card ref={(node) => { fieldRefs.current.datetime = node; }}>
            {renderFieldHeader("datetime")}
            <CardContent>
              <Field data-invalid={Boolean(errors.datetime)} data-disabled={fieldState.datetime.disabled}>
                <Popover
                  open={datetimePickerOpen}
                  onOpenChange={(open) => setDatetimePickerOpen(open)}
                >
                  <PopoverTrigger
                    id="datetime"
                    type="button"
                    disabled={fieldState.datetime.disabled}
                    aria-invalid={Boolean(errors.datetime)}
                    aria-describedby={
                      errors.datetime ? "datetime-error" : undefined
                    }
                    aria-required={fieldState.datetime.required}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-start px-3 text-left font-normal",
                      !values.datetime && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="size-4" aria-hidden="true" />
                    <span>{datetimeButtonLabel}</span>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-3">
                    <Calendar
                      mode="single"
                      selected={selectedDatetimeDate}
                      onSelect={updateDatetimeDate}
                      locale={calendarLocale}
                    />
                    <div className="border-t pt-3">
                      <Field>
                        <FieldLabel htmlFor="datetime-time">{t.time}</FieldLabel>
                        <div className="relative">
                          <ClockIcon
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <Input
                            id="datetime-time"
                            type="time"
                            value={selectedDatetimeTime}
                            onChange={(event) =>
                              updateDatetimeTime(event.target.value)
                            }
                            disabled={fieldState.datetime.disabled}
                            aria-label={t.time}
                            className="pl-9"
                          />
                        </div>
                      </Field>
                    </div>
                  </PopoverContent>
                </Popover>
                <FieldError id="datetime-error">{errors.datetime}</FieldError>
              </Field>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {t.consoleHint}
            </p>
            <Button type="submit" size="lg">
              {t.submit}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
