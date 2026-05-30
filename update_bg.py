import re

with open('/Users/reddyrohan/Desktop/Projects/cert/bg_b64.txt', 'r') as f:
    b64 = f.read().replace('\n', '')

data_uri = f'data:image/jpeg;base64,{b64}'

# Update style.css
with open('/Users/reddyrohan/Desktop/Projects/cert/style.css', 'r') as f:
    css = f.read()

css = re.sub(
    r'(\.certificate\s*\{.*?)background:\s*(?:radial-gradient[^;]+|linear-gradient[^;]+|\s*)+;',
    r'\1background: url("' + data_uri + r'") center/cover no-repeat;',
    css,
    flags=re.DOTALL
)

border_hide_css = "\n.cert-border-outer, .cert-border-inner, .cert-ornament, .cert-accent-line { display: none !important; }\n"
if ".cert-border-outer, .cert-border-inner, .cert-ornament, .cert-accent-line" not in css:
    css += border_hide_css

with open('/Users/reddyrohan/Desktop/Projects/cert/style.css', 'w') as f:
    f.write(css)

# Update app.js
with open('/Users/reddyrohan/Desktop/Projects/cert/app.js', 'r') as f:
    js = f.read()

js = re.sub(
    r"root\.style\.background\s*=\s*'#[0-9a-fA-F]+';",
    f"root.style.background = 'url(\"{data_uri}\") center/cover no-repeat';",
    js
)

with open('/Users/reddyrohan/Desktop/Projects/cert/app.js', 'w') as f:
    f.write(js)
