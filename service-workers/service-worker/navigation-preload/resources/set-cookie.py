def main(request, response):
    """
    Returns response with cookies in a Set-Cookie header based on query params
    """
    samesite = request.GET.first("samesite")
    cookie_in_request = "0"
    if request.cookies.get("dummy-cookie-key"):
        cookie_in_request = request.cookies["dummy-cookie-key"].value

    headers = [
        ("Content-Type", "text/html"),
        ("Set-Cookie", "data=" + cookie_in_request),
        ("Set-Cookie", "dummy-cookie-key=1; Secure; SameSite=" + samesite)
    ]
    return (200, headers, cookie_in_request)
