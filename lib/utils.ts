export function formatDate(dateString?: string): string {
  if (!dateString) return "Unknown date"

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date"
  }

  // Format: Month Day, Year (e.g., January 1, 2023)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Add any other utility functions here
export function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ")
}
