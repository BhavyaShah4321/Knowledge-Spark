from django.shortcuts import render

def video_call(request,id):
    return render(request,"video-call.html")