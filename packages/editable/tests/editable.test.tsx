import {
  fireEvent,
  render,
  screen,
  testA11y,
  userEvent,
} from "@chakra-ui/test-utils"
import * as React from "react"
import { Editable, EditableInput, EditablePreview } from "../src"

test("matches snapshot", () => {
  render(
    <Editable defaultValue="testing">
      <EditablePreview data-testid="preview" />
      <EditableInput data-testid="input" />
    </Editable>,
  )

  const preview = screen.getByTestId("preview")
  const input = screen.getByTestId("input")

  expect(input).toHaveAttribute("hidden")
  expect(preview).toHaveTextContent("testing")
})

it("passes a11y test", async () => {
  await testA11y(
    <Editable defaultValue="testing">
      <EditablePreview data-testid="preview" />
      <EditableInput data-testid="input" />
    </Editable>,
  )
})

test("uncontrolled: handles callbacks correctly", async () => {
  const onChange = jest.fn()
  const onCancel = jest.fn()
  const onSubmit = jest.fn()
  const onEdit = jest.fn()

  render(
    <Editable
      onChange={onChange}
      onCancel={onCancel}
      onSubmit={onSubmit}
      onEdit={onEdit}
      defaultValue="Hello "
    >
      <EditablePreview data-testid="preview" />
      <EditableInput data-testid="input" />
    </Editable>,
  )
  const preview = screen.getByTestId("preview")
  const input = screen.getByTestId("input")

  // calls `onEdit` when preview is focused
  fireEvent.focus(preview)
  expect(onEdit).toHaveBeenCalled()

  // calls `onChange` with input on change
  userEvent.type(input, "World")
  expect(onChange).toHaveBeenCalledWith("World")

  // calls `onCancel` with previous value when "esc" pressed
  fireEvent.keyDown(input, { key: "Escape" })
  expect(onCancel).toHaveBeenCalledWith("Hello ")

  fireEvent.focus(preview)

  // calls `onChange` with input on change
  userEvent.type(input, "World")
  expect(onChange).toHaveBeenCalledWith("World")

  // calls `onSubmit` with previous value when "enter" pressed after cancelling
  fireEvent.keyDown(input, { key: "Enter" })
  expect(onSubmit).toHaveBeenCalledWith("Hello World")
})

test("controlled: handles callbacks correctly", () => {
  const onChange = jest.fn()
  const onCancel = jest.fn()
  const onSubmit = jest.fn()
  const onEdit = jest.fn()

  const Component = () => {
    const [value, setValue] = React.useState("Hello ")
    return (
      <Editable
        onChange={(val) => {
          setValue(val)
          onChange(val)
        }}
        onCancel={onCancel}
        onSubmit={onSubmit}
        onEdit={onEdit}
        value={value}
      >
        <EditablePreview data-testid="preview" />
        <EditableInput data-testid="input" />
      </Editable>
    )
  }

  render(<Component />)
  const preview = screen.getByTestId("preview")
  const input = screen.getByTestId("input")

  // calls `onEdit` when preview is focused
  fireEvent.focus(preview)
  expect(onEdit).toHaveBeenCalled()

  // calls `onChange` with new input on change
  // since we called `focus(..)` first, editable will focus and select the text
  // typing will clear the values in input and add the next text.
  userEvent.type(input, "World")
  expect(onChange).toHaveBeenCalledWith("World")

  // calls `onSubmit` with `value`
  fireEvent.keyDown(input, { key: "Enter" })
  expect(onSubmit).toHaveBeenCalledWith("World")

  expect(input).not.toBeVisible()
  fireEvent.focus(preview)

  // update the input value
  userEvent.type(input, "Rasengan")

  // press `Escape`
  fireEvent.keyDown(input, { key: "Escape" })

  // calls `onCancel` with previous `value`
  expect(onSubmit).toHaveBeenCalledWith("World")
})

test("handles preview and input callbacks", () => {
  const onFocus = jest.fn()
  const onBlur = jest.fn()
  const onChange = jest.fn()
  const onKeyDown = jest.fn()

  render(
    <Editable defaultValue="Hello ">
      <EditablePreview onFocus={onFocus} data-testid="preview" />
      <EditableInput
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
        data-testid="input"
      />
    </Editable>,
  )
  const preview = screen.getByTestId("preview")
  const input = screen.getByTestId("input")

  // calls `onFocus` when preview is focused
  fireEvent.focus(preview)
  expect(onFocus).toHaveBeenCalled()

  // calls `onChange` when input is changed
  userEvent.type(input, "World")
  expect(onChange).toHaveBeenCalled()

  // calls `onKeyDown` when key is pressed in input
  fireEvent.keyDown(input, { key: "Escape" })
  expect(onKeyDown).toHaveBeenCalled()

  expect(input).not.toBeVisible()
})

test("has the proper aria attributes", () => {
  const { rerender } = render(
    <Editable defaultValue="">
      <EditablePreview data-testid="preview" />
      <EditableInput data-testid="input" />
    </Editable>,
  )
  let preview = screen.getByTestId("preview")
  let input = screen.getByTestId("input")

  // preview and input do not have aria-disabled when `Editable` is not disabled
  expect(preview).not.toHaveAttribute("aria-disabled")
  expect(input).not.toHaveAttribute("aria-disabled")

  rerender(
    <Editable isDisabled defaultValue="">
      <EditablePreview data-testid="preview" />
      <EditableInput data-testid="input" />
    </Editable>,
  )

  preview = screen.getByTestId("preview")
  input = screen.getByTestId("input")

  // preview and input have aria-disabled when `Editable` is disabled
  expect(preview).toHaveAttribute("aria-disabled", "true")
  expect(input).toHaveAttribute("aria-disabled", "true")
})

test("can submit on blur", () => {
  const onSubmit = jest.fn()

  render(
    <Editable submitOnBlur onSubmit={onSubmit} defaultValue="testing">
      <EditablePreview data-testid="preview" />
      <EditableInput data-testid="input" />
    </Editable>,
  )

  const input = screen.getByTestId("input")

  fireEvent.blur(input)
  expect(onSubmit).toHaveBeenCalledWith("testing")
})

test("startWithEditView when true focuses on the input ", () => {
  render(
    <Editable startWithEditView defaultValue="Chakra testing">
      <EditablePreview />
      <EditableInput data-testid="input" />
    </Editable>,
  )

  const input = screen.getByTestId("input")

  expect(document.activeElement === input).toBe(true)
})

test.each([
  { startWithEditView: true, text: undefined },
  { startWithEditView: false, text: undefined },
  { startWithEditView: true, text: "Bob" },
  { startWithEditView: false, text: "Bob" },
])(
  "controlled: sets value toPrevValue onCancel, startWithEditView: $startWithEditView",
  ({ startWithEditView, text }) => {
    const Component = () => {
      const [name, setName] = React.useState("")

      React.useEffect(() => {
        setName("John")
      }, [])

      return (
        <Editable
          value={name}
          startWithEditView={startWithEditView}
          onChange={(value) => {
            setName(value)
          }}
          onSubmit={(value) => {
            setName(value)
          }}
          onCancel={(value) => {
            setName(value)
          }}
          placeholder="Enter your name"
        >
          <EditablePreview data-testid="preview" />
          <EditableInput data-testid="input" />
        </Editable>
      )
    }

    render(<Component />)
    const input = screen.getByTestId("input")
    const preview = screen.getByTestId("preview")
    if (!startWithEditView) {
      fireEvent.focus(preview)
    } else {
      fireEvent.focus(input)
    }
    if (text) {
      userEvent.type(input, text)
    }
    fireEvent.keyDown(input, { key: "Escape" })

    expect(preview).toHaveTextContent("John")
  },
)

test("should not be interactive when disabled", () => {
  render(
    <Editable defaultValue="editable" isDisabled>
      <EditablePreview data-testid="preview" />
      <EditableInput data-testid="input" />
    </Editable>,
  )

  userEvent.click(screen.getByText(/editable/))
  expect(screen.getByTestId("input")).not.toBeVisible()
})
