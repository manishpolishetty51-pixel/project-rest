from pathlib import Path
from typing import Annotated, TypedDict

from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

# Reads GOOGLE_API_KEY from the repo-root .env (or backend/.env)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv()

RESTAURANTS = {
    "Spice Palace": {"cuisine": "indian", "rating": 4.5, "price": "₹₹",
                     "address": "12 Curry Lane", "phone": "9111222333",
                     "hours": "11 AM - 11 PM", "specialties": "Butter Chicken, Biryani"},
    "Curry House": {"cuisine": "indian", "rating": 4.3, "price": "₹₹",
                    "address": "45 Masala Road", "phone": "9222333444",
                    "hours": "12 PM - 10 PM", "specialties": "Paneer Tikka, Naan"},
    "Taj Flavors": {"cuisine": "indian", "rating": 4.7, "price": "₹₹₹",
                    "address": "1 Palace Avenue", "phone": "9333444555",
                    "hours": "12 PM - 11 PM", "specialties": "Thali, Kebabs"},
    "Dragon House": {"cuisine": "chinese", "rating": 4.5, "price": "₹₹",
                     "address": "8 Dragon Street", "phone": "9444555666",
                     "hours": "11 AM - 10 PM", "specialties": "Kung Pao Chicken"},
    "Ming's Kitchen": {"cuisine": "chinese", "rating": 4.3, "price": "₹₹",
                       "address": "22 Lotus Road", "phone": "9444555777",
                       "hours": "11 AM - 10 PM", "specialties": "Hakka Noodles"},
    "Golden Wok": {"cuisine": "chinese", "rating": 4.8, "price": "₹₹₹",
                   "address": "777 Wok Street, Central Market", "phone": "9555666777",
                   "hours": "11 AM - 11 PM", "specialties": "Szechuan Noodles, Dim Sum"},
}


@tool
def search_restaurants(cuisine: str) -> str:
    """Search restaurants by cuisine (e.g. 'indian', 'chinese')."""
    found = [
        f"{name} ⭐{r['rating']} {r['price']}"
        for name, r in RESTAURANTS.items()
        if cuisine.lower() in r["cuisine"]
    ]
    return "\n".join(found) or f"No restaurants found for cuisine '{cuisine}'."


@tool
def get_restaurant_details(name: str) -> str:
    """Get address, phone, hours and specialties for a restaurant by name."""
    for rname, r in RESTAURANTS.items():
        if rname.lower() == name.lower():
            return (f"{rname} ({r['rating']}⭐)\n📍 {r['address']}\n📞 {r['phone']}\n"
                    f"🕒 {r['hours']}\nSpecialties: {r['specialties']}")
    return f"No restaurant named '{name}'."


@tool
def check_availability(name: str, party_size: int, date: str) -> str:
    """Check reservation availability for a restaurant, party size and date (YYYY-MM-DD)."""
    if name.lower() not in (n.lower() for n in RESTAURANTS):
        return f"No restaurant named '{name}'."
    # Placeholder logic: replace with a real booking lookup
    if party_size > 10:
        return f"✗ {name} has no availability for {party_size} people on {date}"
    return f"✓ {name} has availability for {party_size} people on {date}"


TOOLS = [search_restaurants, get_restaurant_details, check_availability]

SYSTEM_PROMPT = (
    "You are a restaurant assistant. You can only search restaurants, show details "
    "and check reservation availability, using the provided tools. For anything else "
    "reply: \"That's outside what I can help with. I can search restaurants, show "
    "details and check reservation availability.\" Keep replies short and plain text."
)

llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", timeout=25, max_retries=1).bind_tools(TOOLS)


class State(TypedDict):
    messages: Annotated[list, add_messages]


def assistant(state: State):
    return {"messages": [llm.invoke([SystemMessage(SYSTEM_PROMPT)] + state["messages"])]}


builder = StateGraph(State)
builder.add_node("assistant", assistant)
builder.add_node("tools", ToolNode(TOOLS))
builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", tools_condition)  # tool call -> tools, else END
builder.add_edge("tools", "assistant")
graph = builder.compile()


def run_agent(message: str, history: list[dict]) -> str:
    messages = [
        HumanMessage(m["content"]) if m["role"] == "user" else AIMessage(m["content"])
        for m in history
    ]
    messages.append(HumanMessage(message))
    result = graph.invoke({"messages": messages})
    content = result["messages"][-1].content
    if isinstance(content, list):  # Gemini may return content parts
        content = "".join(p.get("text", "") if isinstance(p, dict) else str(p) for p in content)
    return content
