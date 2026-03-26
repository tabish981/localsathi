import sys
from docx import Document

def extract_docx(file_path):
    try:
        doc = Document(file_path)
        text = []
        for para in doc.paragraphs:
            if para.text.strip():
                text.append(para.text.strip())
        return "\n".join(text)
    except Exception as e:
        return str(e)

with open('C:\\Users\\tabish Ansari\\OneDrive\\Desktop\\localsathi\\check_part2.txt', 'w', encoding='utf-8') as f:
    f.write(extract_docx('C:\\Users\\tabish Ansari\\OneDrive\\Desktop\\localsathi\\Black Book Part 2.docx'))
print("Extracted")
