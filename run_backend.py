from backend import create_app

#sem argumentos está usando o Config de __init__
app = create_app()

if __name__ == '__main__':
        app.run(debug=True, port=5003)
