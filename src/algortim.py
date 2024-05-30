from io import BytesIO
import numpy as np
from PIL import Image, UnidentifiedImageError
from stl import mesh
import base64
import uuid
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Directorio donde se guardarán los archivos STL
STL_DIRECTORY = 'stl_files'
os.makedirs(STL_DIRECTORY, exist_ok=True)

@app.route('/process_images', methods=['POST'])
def process_images():
    try:
        # Obtener imágenes en base64 desde la solicitud
        foto_planta_pie_b64 = request.json.get('foto_planta_pie')
        if not foto_planta_pie_b64:
            return jsonify({'error': 'No se proporcionó la imagen en base64'}), 400

        # Decodificar la imagen desde base64
        try:
            image_data = base64.b64decode(foto_planta_pie_b64)
            image = Image.open(BytesIO(image_data))
            image.verify()  # Verificar que la imagen no esté corrupta
            image = Image.open(BytesIO(image_data))  # Volver a abrir la imagen después de la verificación
        except (base64.binascii.Error, UnidentifiedImageError, Image.DecompressionBombError) as e:
            return jsonify({'error': 'La imagen proporcionada no es válida o está corrupta'}), 400

        # Convertir la imagen a un array NumPy y obtener las dimensiones
	 image_array = np.array(image)
        height, width, _ = image_array.shape

        # Construir los vértices y caras de la malla 3D utilizando operaciones de NumPy
        x, y = np.meshgrid(np.arange(width), np.arange(height))
        z = image_array[:, :, 0]
        vertices = np.column_stack([x.flatten(), y.flatten(), z.flatten()])
        vertices_indices = np.arange(width * height).reshape(height, width)

        faces = []
        for i in range(height - 1):
            for j in range(width - 1):
                faces.append([vertices_indices[i, j], vertices_indices[i + 1, j], vertices_indices[i + 1, j + 1]])
                faces.append([vertices_indices[i, j], vertices_indices[i + 1, j + 1], vertices_indices[i, j + 1]])

        # Generar y guardar el archivo STL
        stl_filename = str(uuid.uuid4()) + '.stl'
        stl_filepath = os.path.join(STL_DIRECTORY, stl_filename)
        mesh_data = mesh.Mesh(np.zeros(len(faces), dtype=mesh.Mesh.dtype))
        for i, face in enumerate(faces):
            for j in range(3):
                mesh_data.vectors[i][j] = vertices[face[j]]
        mesh_data.save(stl_filepath)

       # Devolver un mensaje indicando que todo salió perfecto junto con la URL de descarga
        download_url = request.erhost_url + 'download_stl/' + stl_filename
        return jsonify({'msg': 'Todo salió perfecto', 'stl_filename': stl_filename, 'download_url': download_url})
    except Exception as e:
        app.logger.error(f"Exception: {e}")
        return jsonify({'error': 'Ocurrió un error al procesar la imagen'}), 500

@app.route('/download_stl/<filename>', methods=['GET'])
def download_stl(filename):
    try:
        return send_from_directory(STL_DIRECTORY, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'Archivo no encontrado'}), 404

if __name__ == '__main__':
    app.run(debug=True)
