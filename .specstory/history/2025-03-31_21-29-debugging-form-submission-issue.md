## SpecStory

## Debugging Form Submission Issue (31/03/2025, 21:29:48)

_**User**_

@AddMatchForm.tsx @FormFieldSelect.tsx @dashboard.tsx 

I am noticing a issue where, when I submit the form `AddMatchDetailsForm`, in the action on the page @dashboard.tsx , I am seeing only the values entered on text input. The value selected on @FormFieldSelect.tsx is not showing inside action.

When I debugged, I can see the value of `matchId` is correctly saved in hook-form state. Can you help me debug this issue?

---

_**Assistant**_

I can help you debug this issue with the form submission not including the value from your `FormFieldSelect` component.

The primary problem is that your `AddMatchDetailsForm` component doesn't actually handle form submission correctly. You have a submit button, but no `onSubmit` handler to process the form data.

Here's how to fix it:

```tsx:app/components/common/AddMatchForm.tsx
// ... existing code ...

export function AddMatchDetailsForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matchId: "",
      User1: "",
      User2: "",
      User3: "",
      User4: "",
      User5: "",
    },
  });

  console.log("watch", form.watch());
  
  // Add this function to handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Create a FormData object
    const formData = new FormData();
    
    // Add all form values to the FormData object
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Submit the form - assuming you're using this in a route with action
    submit(formData, { method: "post" });
  }

  return (
    <Form {...form}>
      {/* Add the onSubmit handler to the form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormFieldSelect form={form} name="matchId" />
        <div className="mt-8 mb-8 border-t border-gray-200 border-dashed"></div>
        
        {/* ... existing code for other form fields ... */}
        
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
```

You need to make two key changes:

1. Import the `submit` function from `react-router-dom` at the top of your file:
```tsx
import { submit } from "react-router-dom";
```

2. Create an `onSubmit` handler function that:
   - Takes the form values
   - Creates a FormData object 
   - Adds all your form values to it
   - Uses the React Router `submit` function to post the data

Also, your current form is using the Shadcn UI `Form` component, but you still need to add an actual HTML `<form>` element inside it with the proper `onSubmit` handler.

The reason your select value isn't showing up in the action is that you're not properly collecting and submitting the form data - there's no connection between your React Hook Form state and what gets sent to your action.

---



---

