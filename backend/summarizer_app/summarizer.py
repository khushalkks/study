from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

MODEL_NAME = "sshleifer/distilbart-cnn-12-6"

# tokenizer + model load
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

def summarize_text(text: str) -> str:
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    )

    # summary_ids = model.generate(
    #     inputs["input_ids"],
    #     attention_mask=inputs["attention_mask"],
    # max_length=180,
    # min_length=60,
    # num_beams=6,
    # length_penalty=1.5,
    # no_repeat_ngram_size=3,
    # early_stopping=True
    #     # max_length=150,
    #     # min_length=40,
    #     # num_beams=4,
    #     # length_penalty=2.0,
    #     # early_stopping=True
    # )

    summary_ids = model.generate(
    input_ids=inputs["input_ids"],
    attention_mask=inputs["attention_mask"],

    # 📏 Length control (badi + detailed summary)
    max_length=280,
    min_length=120,

    # 🎯 Quality control
    num_beams=8,
    length_penalty=1.2,

    # 🔁 Repetition control
    no_repeat_ngram_size=3,
    repetition_penalty=1.2,
    encoder_no_repeat_ngram_size=3,

    # 🧠 Better stopping
    early_stopping=False,

    # 🧪 Stable & deterministic output
    do_sample=False
)

    summary = tokenizer.decode(
        summary_ids[0],
        skip_special_tokens=True
    )

    return summary
