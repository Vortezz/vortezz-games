import json

with open("data/tracks.json", "r") as f:
    data = json.load(f)


def simplify(song):
    return {
        "id": song["id"],
        "title": song["title"],
        "artist": song["artist"]["name"],
        "picture": song["album"]["cover_big"] if "cover_big" in song["album"] else "",
        "link": song["link"]
    }


with open("../apps/api/data/blindtest.json", "w") as f:
    json.dump([simplify(song) for song in data['data']], f)

if __name__ == "__main__":
    pass
