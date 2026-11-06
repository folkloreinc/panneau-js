---
'@panneau/intl': patch
'@panneau/fields': patch
---

The address field checks its postal code for Canada and the United States, the countries whose format the `postalCode` rule knows, once the code loses focus and then as it is typed: "Enter a postal code like H2X 1Y4." or "Enter a ZIP code like 12345.", in English and French. It no longer waits for the form to say so. The form's errors, once shown, replace that check.
