import PyPDF2

def extract_pdf():
    pdf_path = r"c:\Users\tabish Ansari\OneDrive\Desktop\localsathi\Black_book_final[1].Sadeem.pdf"
    output_path = r"c:\Users\tabish Ansari\OneDrive\Desktop\localsathi\temp_pdf.txt"
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            # just get first 10 pages for structure analysis to avoid huge text
            num_pages = min(20, len(reader.pages))
            for i in range(num_pages):
                text += reader.pages[i].extract_text() + "\n"
        with open(output_path, 'w', encoding='utf-8') as out:
            out.write(text)
        print("Extracted first 20 pages successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_pdf()
