import json
import re

with open("data/tracks.json", "r") as f:
    data = json.load(f)


def simplify(song):
    default_title = song["title"]
    pattern = re.compile(r"\([^)]+\)", flags=re.MULTILINE)

    default_title = pattern.sub("", default_title).strip()

    return {
        "id": song["id"],
        "title": default_title,
        "artist": song["artist"]["name"],
        "picture": song["album"]["cover_big"] if "cover_big" in song["album"] else "",
        "link": song["link"]
    }


with open("../apps/api/data/blindtest.json", "w") as f:
    json.dump([simplify(song) for song in data['data'] if song["preview"] != ""], f)

if __name__ == "__main__":
    pass
