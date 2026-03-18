# import requests


# def clean_mermaid_output(text: str) -> str:
#     if not text:
#         return ""

#     # Remove markdown fences
#     text = text.replace("```mermaid", "")
#     text = text.replace("```", "")

#     # Remove everything before mindmap
#     if "mindmap" in text:
#         text = text[text.index("mindmap"):]

#     return text.strip()


# def fix_mermaid_format(text: str, topic: str) -> str:
#     """
#     Convert LLM tree-style output into strict Mermaid mindmap format.
#     """

#     lines = text.splitlines()

#     fixed_lines = ["mindmap", f"  root(({topic}))"]

#     for line in lines:
#         line = line.strip()

#         if not line:
#             continue

#         # Skip first mindmap line
#         if line.lower() == "mindmap":
#             continue

#         # Remove tree markers like |-
#         line = line.replace("|-", "").strip()

#         # Remove bullets if present
#         if line.startswith("-"):
#             line = line[1:].strip()

#         fixed_lines.append(f"    {line}")

#     return "\n".join(fixed_lines)


# def generate_mindmap(topic: str) -> str:

#     if not topic.strip():
#         return "mindmap\n  root((Invalid Topic))"

#     url = "http://localhost:11434/api/generate"

#     prompt = f"""
# Generate a structured mind map in Mermaid mindmap format.

# Rules:
# - Only output valid Mermaid mindmap syntax
# - Use indentation (no |- symbols)
# - Start directly with: mindmap
# - No explanation text

# Topic: {topic}
# """

#     payload = {
#         "model": "mistral",
#         "prompt": prompt,
#         "stream": False
#     }

#     try:
#         response = requests.post(url, json=payload)
#         data = response.json()

#         output_text = data.get("response", "")

#         cleaned = clean_mermaid_output(output_text)

#         final_output = fix_mermaid_format(cleaned, topic)

#         return final_output

#     except Exception as e:
#         print("Ollama Error:", str(e))
#         return f"""mindmap
#   root(({topic}))
#     Error
#       Ollama not running
# """

import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "mistral"


def json_to_mermaid(tree):

    mermaid = ["mindmap"]

    def walk(node, level=1):
        indent = "  " * level
        mermaid.append(f"{indent}{node['name']}")

        for child in node.get("children", []):
            walk(child, level + 1)

    walk(tree)

    return "\n".join(mermaid)


def generate_mindmap(topic: str):

    prompt = f"""
Create a structured knowledge tree for the topic.

Return ONLY JSON.

Format:

{{
 "name": "{topic}",
 "children":[
    {{
      "name":"Concept",
      "children":[
          {{"name":"Subtopic"}},
          {{"name":"Subtopic"}}
      ]
    }}
 ]
}}

Topic: {topic}

Rules:
- Create 3 main branches
- Each branch must contain 3 subtopics
- Return JSON only
"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7
        }
    }

    response = requests.post(OLLAMA_URL, json=payload)

    data = response.json()

    text = data.get("response", "")

    try:
        tree = json.loads(text)
        return json_to_mermaid(tree)
    except:
        return f"""mindmap
  root(({topic}))
    Error
      Could not parse model output
"""

# import requests
# import json

# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL = "mistral"


# # -----------------------------
# # Clean JSON from LLM response
# # -----------------------------
# def clean_llm_json(text: str) -> str:

#     if not text:
#         return ""

#     text = text.strip()

#     text = text.replace("```json", "")
#     text = text.replace("```", "")

#     start = text.find("{")
#     end = text.rfind("}") + 1

#     if start != -1 and end != -1:
#         text = text[start:end]

#     return text


# # -----------------------------
# # Convert JSON → Mermaid
# # -----------------------------
# def json_to_mermaid(tree: dict) -> str:

#     mermaid = ["mindmap"]

#     def walk(node, level=1):

#         indent = "  " * level

#         if level == 1:
#             mermaid.append(f"{indent}root(({node['name']}))")
#         else:
#             mermaid.append(f"{indent}{node['name']}")

#         for child in node.get("children", []):
#             walk(child, level + 1)

#     walk(tree)

#     return "\n".join(mermaid)


# # -----------------------------
# # Generate Mindmap
# # -----------------------------
# def generate_mindmap(topic: str):

#     if not topic:
#         return {
#             "tree": None,
#             "mermaid": "mindmap\n  root((Invalid Topic))"
#         }

#     prompt = f"""
# Generate a knowledge tree for the topic.

# Return ONLY JSON.

# Example:

# {{
#  "name": "{topic}",
#  "children":[
#    {{
#      "name":"Concept",
#      "children":[
#         {{"name":"Detail"}},
#         {{"name":"Detail"}}
#      ]
#    }}
#  ]
# }}

# Topic: {topic}
# """

#     payload = {
#         "model": MODEL,
#         "prompt": prompt,
#         "stream": False,
#         "options": {"temperature": 0.7}
#     }

#     try:

#         response = requests.post(OLLAMA_URL, json=payload)

#         data = response.json()

#         text = data.get("response", "")

#         print("RAW LLM OUTPUT:", text)

#         cleaned = clean_llm_json(text)

#         if not cleaned:
#             raise ValueError("Empty JSON")

#         tree = json.loads(cleaned)

#         mermaid = json_to_mermaid(tree)

#         return {
#             "tree": tree,
#             "mermaid": mermaid
#         }

#     except Exception as e:

#         print("Mindmap generation failed:", e)

#         return {
#             "tree": None,
#             "mermaid": f"""mindmap
#   root(({topic}))
#     Concept
#       Example
#       Example
# """
#         }

# # -----------------------------
# # Add Node
# # -----------------------------
# def add_node(tree: dict, parent_name: str, new_node: str):

#     if tree["name"] == parent_name:
#         tree.setdefault("children", []).append({"name": new_node})
#         return True

#     for child in tree.get("children", []):
#         if add_node(child, parent_name, new_node):
#             return True

#     return False


# # -----------------------------
# # Delete Node
# # -----------------------------
# def delete_node(tree: dict, node_name: str):

#     children = tree.get("children", [])

#     for child in children:

#         if child["name"] == node_name:
#             children.remove(child)
#             return True

#         if delete_node(child, node_name):
#             return True

#     return False


# # -----------------------------
# # Expand Node using AI
# # -----------------------------
# def expand_node(node_name: str):

#     prompt = f"""
# Expand this concept into subtopics.

# Return JSON:

# {{
#  "children":[
#    {{"name":"subtopic"}},
#    {{"name":"subtopic"}},
#    {{"name":"subtopic"}}
#  ]
# }}

# Concept: {node_name}
# """

#     payload = {
#         "model": MODEL,
#         "prompt": prompt,
#         "stream": False
#     }

#     try:

#         response = requests.post(OLLAMA_URL, json=payload)

#         data = response.json()

#         text = clean_llm_json(data.get("response", ""))

#         return json.loads(text)

#     except:

#         return {"children": []}