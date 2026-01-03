
from django.shortcuts import render

def about(request):
    return render(request, 'about.html')

def contacts(request):
    return render(request, 'contacts.html')

def policy(request):
    return render(request, 'policy.html')
