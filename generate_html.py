import re

# Read file
with open("01.対策KW/シャネル デザイナー/シャネル 結婚指輪 芸能人.md", "r") as f:
    content = f.read()

def process_content(text):
    lines = text.split("\n")
    html_lines = []
    
    in_list = False
    list_items = []
    
    in_table = False
    table_lines = []
    
    # Pre-process lines to group list items and table rows? 
    # Or state machine approach.
    
    # CTA URLs to identify
    cta_urls = [
        "https://daikichi-kaitori.jp/shop/",
        "https://daikichi-kaitori.jp/purchase/visit/",
        "https://daikichi-kaitori.jp/purchase/delivery/"
    ]

    for i, line in enumerate(lines):
        line = line.strip()
        
        # 1. Table Processing
        if line.startswith("|"):
            in_table = True
            table_lines.append(line)
            continue
        elif in_table:
             # End of table detected (empty line or non-pipe)
             # Process accumulated table_lines
             html_lines.append('<div class="scroll-box">')
             html_lines.append('<table>')
             html_lines.append('<tbody>')
             for r_idx, row_text in enumerate(table_lines):
                 if ":---" in row_text: continue # skip separator
                 
                 # clean row
                 row_text = row_text.strip("|")
                 cols = row_text.split("|")
                 
                 html_lines.append("<tr>")
                 for c_idx, c in enumerate(cols):
                     c = c.strip()
                     # Replace markdown links in table to regular links
                     # Table links are NOT CTA buttons, just links
                     c = re.sub(r"\[\*\*(.*?)\*\*\]\((.*?)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', c)
                     c = re.sub(r"\[(.*?)\]\((.*?)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', c)
                     c = c.replace("<br>", "") # Basic cleanup if needed, but draft has <br> in table? No, it has pure text.
                     
                     # Check if cell has <br> from original markdown? Not likely in this simple draft.
                     
                     if r_idx == 0:
                         html_lines.append(f'<th style="background-color: #090059; color: #ffffff; text-align: center;">{c}</th>')
                     else:
                         html_lines.append(f'<td style="text-align: center;">{c}</td>')
                 html_lines.append("</tr>")
             html_lines.append("</tbody>")
             html_lines.append("</table>")
             html_lines.append("</div>")
             in_table = False
             table_lines = []
        
        if not line:
            if in_list:
                html_lines.append('<div class="post-box-red">')
                html_lines.append("<ul>")
                for item in list_items:
                    html_lines.append(f"<li>{item}</li>")
                html_lines.append("</ul>")
                html_lines.append("</div>")
                in_list = False
                list_items = []
            continue

        # 2. Header Processing
        if line.startswith("#"):
            if in_list:
                html_lines.append('<div class="post-box-red">')
                html_lines.append("<ul>")
                for item in list_items:
                    html_lines.append(f"<li>{item}</li>")
                html_lines.append("</ul>")
                html_lines.append("</div>")
                in_list = False
                list_items = []

            # Headers
            level = len(line.split()[0])
            content_text = line.lstrip("#").strip()
            # Remove bold formatting from headers if present
            content_text = content_text.replace("**", "")
            
            # H1 -> Skip or convert? Rule says no H1.
            # But the draft H1 is likely the title. The body H2s are subsections.
            # Wait, if H1 is the title, I shouldn't output it as part of the body HTML? 
            # Usually the title is entered in the CMS title field. 
            # I'll output H2 and below. 
            # The draft starts with Lead text, then H2. 
            # There is NO H1 in the body text I see in the draft file (it has ##).
            # Wait, looking at file content:
            # Line 19: ## **シャネルの結婚指輪を選んだ芸能人と愛用者**
            # So headers are H2.
            
            html_lines.append(f"<h{level}>{content_text}</h{level}>")
            continue

        # 3. List Processing
        if line.startswith("* "):
            in_list = True
            list_items.append(line[2:])
            continue
            
        # 4. Text Processing
        # Helper to process inline formatting
        def format_inline(text_segment):
            # Bold marker
            text_segment = re.sub(r"\*\*(.*?)\*\*", r'<strong><span class="post-text-marker">\1</span></strong>', text_segment)
            
            # Links
            def link_replace(match):
                label = match.group(1)
                url = match.group(2)
                # Remove bold tags from label if they were added inside link
                label = label.replace('<strong><span class="post-text-marker">', '').replace('</span></strong>', '')
                return f'<a href="{url}" target="_blank" rel="noopener">{label}</a>'
                
            text_segment = re.sub(r"\[(.*?)\]\((.*?)\)", link_replace, text_segment)
            return text_segment

        # Check if line is a CTA button
        # CTA buttons in draft: [**Label**](URL)
        is_cta = False
        for url in cta_urls:
            # Check if line contains the URL and is a link format
            if url in line and "[" in line and "]" in line and "(" in line:
                # Extract label and create CTA
                # Matches [**Label**](URL) or [Label](URL)
                match = re.search(r"\[\*\*(.*?)\*\*\]\((.*?)\)", line)
                if not match:
                    match = re.search(r"\[(.*?)\]\((.*?)\)", line)
                
                if match:
                    label = match.group(1)
                    target_url = match.group(2)
                    html_lines.append(f'<div class="cta-button"><a href="{target_url}" target="_blank" rel="noopener">{label}</a></div>')
                    is_cta = True
                    break
        
        if is_cta:
            continue
            
        # Normal text paragraph
        formatted_line = format_inline(line)
        html_lines.append(f"<p>{formatted_line}</p>")

    if in_list:
        html_lines.append('<div class="post-box-red">')
        html_lines.append("<ul>")
        for item in list_items:
            html_lines.append(f"<li>{item}</li>")
        html_lines.append("</ul>")
        html_lines.append("</div>")

    return "\n".join(html_lines)

print(process_content(content))
