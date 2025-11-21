"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientCompany, setClientCompany] = useState("")

  // Example form fields
  const [textField, setTextField] = useState("")
  const [numberField, setNumberField] = useState("")
  const [radioChoice, setRadioChoice] = useState("option1")
  const [checkboxes, setCheckboxes] = useState<string[]>([])

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      setCheckboxes([...checkboxes, value])
    } else {
      setCheckboxes(checkboxes.filter((item) => item !== value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          clientName,
          clientCompany,
          textField,
          numberField: numberField ? parseFloat(numberField) : null,
          radioChoice,
          checkboxes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      const project = await response.json()
      router.push(`/projects/${project.id}`)
    } catch (error) {
      setError("Failed to create project. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Fill in the details below to create a new project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="My Awesome Project"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="Brief description of the project"
                />
              </div>
            </div>

            <Separator />

            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Client Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={isLoading}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientCompany">Company</Label>
                  <Input
                    id="clientCompany"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    disabled={isLoading}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Example Form Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Technical Details (Examples)</h3>

              {/* Text Field Example */}
              <div className="space-y-2">
                <Label htmlFor="textField">Text Field Example</Label>
                <Input
                  id="textField"
                  value={textField}
                  onChange={(e) => setTextField(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter any text here"
                />
                <p className="text-xs text-muted-foreground">
                  This is an example of a text input field
                </p>
              </div>

              {/* Number Field Example */}
              <div className="space-y-2">
                <Label htmlFor="numberField">Number Field Example</Label>
                <Input
                  id="numberField"
                  type="number"
                  step="0.01"
                  value={numberField}
                  onChange={(e) => setNumberField(e.target.value)}
                  disabled={isLoading}
                  placeholder="123.45"
                />
                <p className="text-xs text-muted-foreground">
                  This is an example of a number input field
                </p>
              </div>

              {/* Radio Group Example */}
              <div className="space-y-3">
                <Label>Radio Group Example</Label>
                <RadioGroup
                  value={radioChoice}
                  onValueChange={setRadioChoice}
                  disabled={isLoading}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="option1" />
                    <Label htmlFor="option1" className="font-normal cursor-pointer">
                      Option 1 - Standard
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="option2" />
                    <Label htmlFor="option2" className="font-normal cursor-pointer">
                      Option 2 - Premium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option3" id="option3" />
                    <Label htmlFor="option3" className="font-normal cursor-pointer">
                      Option 3 - Enterprise
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Select one option from the list
                </p>
              </div>

              {/* Checkboxes Example */}
              <div className="space-y-3">
                <Label>Checkboxes Example</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="check1"
                      checked={checkboxes.includes("feature1")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("feature1", checked as boolean)
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="check1" className="font-normal cursor-pointer">
                      Feature 1 - Advanced Analytics
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="check2"
                      checked={checkboxes.includes("feature2")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("feature2", checked as boolean)
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="check2" className="font-normal cursor-pointer">
                      Feature 2 - API Access
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="check3"
                      checked={checkboxes.includes("feature3")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("feature3", checked as boolean)
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="check3" className="font-normal cursor-pointer">
                      Feature 3 - Custom Reports
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="check4"
                      checked={checkboxes.includes("feature4")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("feature4", checked as boolean)
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="check4" className="font-normal cursor-pointer">
                      Feature 4 - Priority Support
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select multiple options
                </p>
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
