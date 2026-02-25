# PowerShell script to convert Markdown to HTML that can be opened in Word

$docs = @(
    "README.md",
    "01-Project-Plan.md",
    "02-System-Architecture.md",
    "03-Database-Schema-ER-Diagram.md",
    "04-Sequence-Diagrams.md",
    "05-API-Documentation.md"
)

foreach ($doc in $docs) {
    $inputFile = Join-Path $PSScriptRoot $doc
    $outputFile = Join-Path $PSScriptRoot ($doc -replace '\.md$', '.html')
    
    if (Test-Path $inputFile) {
        Write-Host "Converting $doc to HTML..."
        
        # Read markdown content
        $content = Get-Content -Path $inputFile -Raw
        
        # Create basic HTML with proper formatting
        $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>$($doc -replace '\.md$', '')</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 40px auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 40px;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #bdc3c7;
            padding-bottom: 8px;
            margin-top: 30px;
        }
        h3 {
            color: #555;
            margin-top: 25px;
        }
        pre, code {
            background-color: #f4f4f4;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            overflow-x: auto;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 14px;
        }
        code {
            padding: 2px 6px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        li {
            margin: 8px 0;
        }
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin: 20px 0;
            color: #555;
            font-style: italic;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
<pre>
$content
</pre>
</body>
</html>
"@
        
        # Write HTML file
        $html | Out-File -FilePath $outputFile -Encoding UTF8
        Write-Host "Created: $outputFile" -ForegroundColor Green
    }
}

Write-Host "`nConversion complete!" -ForegroundColor Cyan
Write-Host "`nTo convert to Word (.docx):" -ForegroundColor Yellow
Write-Host "1. Open each .html file in Microsoft Word" -ForegroundColor White
Write-Host "2. Click 'File' > 'Save As'" -ForegroundColor White
Write-Host "3. Choose 'Word Document (*.docx)' as the file type" -ForegroundColor White
Write-Host "4. Save the file" -ForegroundColor White
Write-Host "`nOr use this script to open all HTML files in Word:" -ForegroundColor Yellow
Write-Host "Get-ChildItem *.html | ForEach-Object { Start-Process 'winword' `$_.FullName }" -ForegroundColor White
