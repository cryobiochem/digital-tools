\# Invoice Lab – Minimalist Invoice Generator



A lightweight invoice generator for freelancers, small agencies, and makers who want professional invoices without renting heavy, expensive tools every month.



You can create invoices, export PDFs, optionally plug in payments, and keep simple revenue/cost tracking for each job.





\## ✨ Features



\- Create invoices with:

  - Client details (name, email, address)

  - Multiple line items (description, quantity, unit price)

\- Automatic calculations:

  - Subtotal, tax, and total

  - Internal fields for production cost, revenue, and a basic margin ratio

\- Invoice management:

  - Status: draft / sent / paid / overdue / cancelled

  - Local history of past invoices with totals

\- Extras:

  - PDF invoice export

  - Optional Stripe Checkout button for card payments (if configured)



\*\*\*



\## 🖥️ Prerequisites



If your computer has nothing installed yet, follow these steps.



\### 1. Install Node.js



1\. Go to: https://nodejs.org

2\. Download the “LTS” version for your operating system.

3\. Run the installer and accept the default options.

4\. After installing, open a terminal:

   - On Windows: open “Command Prompt” or “PowerShell”

   - On macOS: open “Terminal”

   - On Linux: open your system terminal

5\. Check it worked:



```bash

node -v

npm -v

```



Both commands should show a version number.



\### 2. (Optional) Install a Code Editor



You don’t \*need\* this to run the app, but it helps to edit files.



\- Recommended: Visual Studio Code

  - Download: https://code.visualstudio.com

  - Install with defaults



\*\*\*



\## 📦 Downloading the Project



1\. Create a folder for projects (for example `C:\\\\\\\\Projects` or `~/projects`).

2\. Either:

   - \*\*Option A – Git (recommended):\*\*

     - Install Git: https://git-scm.com/downloads

     - In the terminal, run:



       ```bash

       cd <your-projects-folder>

       git clone https://github.com/<your-username>/invoice-lab.git

       cd invoice-lab

       ```



   - \*\*Option B – Download ZIP:\*\*

     - Go to your GitHub repository page.

     - Click \*\*“Code” → “Download ZIP”\*\*.

     - Extract the ZIP into your projects folder.

     - Open a terminal and `cd` into that folder, for example:



       ```bash

       cd <your-projects-folder>/invoice-lab

       ```



\*\*\*



\## ⚙️ Local Setup



Inside the project folder:



\### 1. Install dependencies



```bash

npm install

```



This downloads the libraries the app needs.



\### 2. Configure environment variables (optional, for Stripe)



If you want the Stripe payment button to work:



1\. In the project root, create a file called `.env.local`.

2\. Add your keys (replace the values with your own):



```bash

STRIPE\\\\\\\_PUBLIC\\\\\\\_KEY=pk\\\\\\\_test\\\\\\\_your\\\\\\\_public\\\\\\\_key\\\\\\\_here

STRIPE\\\\\\\_SECRET\\\\\\\_KEY=sk\\\\\\\_test\\\\\\\_your\\\\\\\_secret\\\\\\\_key\\\\\\\_here

```



If you don’t have Stripe yet or don’t want payments, you can skip this step; just don’t click the payment-related buttons, or hide them in the code later.



\*\*\*



\## ▶️ Running the App Locally



In the project folder:



```bash

npm run dev

```



Then open your browser and go to:



```text

http://localhost:3000

```



You should see the Invoice Generator interface.



Basic workflow:



1\. Fill in your business + client details.

2\. Add line items (description, quantity, unit price).

3\. Check totals and internal metrics.

4\. Save / export PDF / use payment link (if configured).



To stop the app, go back to the terminal and press `Ctrl + C`.



\*\*\*



\## 🧩 Project Structure (High Level)



You don’t need to understand this to \*use\* the app, but it helps if you want to modify it.



\- `invoice-app.tsx` – main screen, ties everything together

\- `invoice-builder.tsx` – the form for editing invoice data

\- `invoice-preview.tsx` – live invoice preview + actions (PDF, pay, send link)

\- `invoice-history.tsx` – saved invoices and basic stats

\- `stripe-checkout.tsx` – Stripe payment integration

\- `settings-dialog.tsx` – currency, invoice prefix, and other settings

\- Utility files (types, calculations, PDF helper) live under `lib`/`utils` (depending on your structure)



\*\*\*



\## 📌 Notes



\- Data is stored locally in your browser (no external database).

\- Ideal as:

  - A standalone invoicing tool for a solo dev/freelancer.

  - A starting point to integrate into your own internal tools.

\- If something doesn’t start:

  - Make sure Node.js is installed.

  - Make sure you ran `npm install` before `npm run dev`.

  - Check the terminal for error messages.



\*\*\*

