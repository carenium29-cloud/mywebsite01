$path = 'c:\Users\Abu\OneDrive\Documents\project\css\login.css'
$lines = [System.IO.File]::ReadAllLines($path)
if ($lines[0].Trim() -eq '``') { 
    $lines = $lines[1..($lines.Length-1)] 
}
[System.IO.File]::WriteAllLines($path, $lines)
Write-Host "Done - removed stray backtick line"
