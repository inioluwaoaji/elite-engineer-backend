from fpdf import FPDF
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

def create_pdf(content, country, filename="constitution.pdf"):
    """Create PDF with constitutional info"""
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Title
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt=f"{country} - Legal Information", ln=True, align='C')
    pdf.ln(10)
    
    # Content
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, txt=content)
    
    pdf.output(filename)
    return filename

def send_email_with_pdf(to_email, pdf_file, country):
    """Send email with PDF attachment"""
    
    from_email = "your_email@gmail.com"
    password = "your_app_password"
    
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = f"Your {country} Legal Document"
    
    body = f"Please find attached your constitutional document for {country}."
    msg.attach(MIMEText(body, 'plain'))
    
    # Attach PDF
    with open(pdf_file, "rb") as attachment:
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f"attachment; filename= {pdf_file}")
        msg.attach(part)
    
    # Send email
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(from_email, password)
    server.send_message(msg)
    server.quit()
    
    print(f"Email sent to {to_email}")