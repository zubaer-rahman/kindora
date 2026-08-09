import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  studentType: z.string().min(1, "Please select your student type"),
  homeCountry: z.string().optional(),
  course: z.string().min(1, "Please enter your course"),
  major: z.string().min(1, "Please enter your major"),
  completionDate: z.date({
    required_error: "Please select a completion date",
  }),
  referralSource: z.string().min(1, "Please select how you heard about us"),
  referralSourceOther: z.string().optional(),
  mediaConsent: z.boolean().default(false),
})

interface StudentInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: z.infer<typeof formSchema>) => void;
}

export function StudentInfoModal({ open, onOpenChange, onComplete }: StudentInfoModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mediaConsent: false,
    },
  })

  const studentTypes = [
    { value: "international", label: "International Student" },
    { value: "domestic", label: "Domestic Student" },
  ]

  const countries = [
    { value: "china", label: "China" },
    { value: "india", label: "India" },
  ]

  const referralSources = [
    { value: "instagram", label: "Instagram" },
    { value: "email", label: "Email" },
    { value: "uts_classes", label: "UTS Classes" },
    { value: "friends", label: "Friends" },
   ]

  const isInternational = form.watch("studentType") === "international"
  const referralSource = form.watch("referralSource")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your academic details to help us better understand your background.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onComplete)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are you an international or domestic student?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {studentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isInternational && (
              <FormField
                control={form.control}
                name="homeCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your home country?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What course are you studying?</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. PhD, Masters of Education, Bachelor of Business" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What major are you currently studying?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your major..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referralSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Where did you hear about this program?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select referral source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {referralSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {referralSource === "other" && (
              <FormField
                control={form.control}
                name="referralSourceOther"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Please specify" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="mediaConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I grant permission and give consent to the use of photographs or electronic media images.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Complete Profile
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}