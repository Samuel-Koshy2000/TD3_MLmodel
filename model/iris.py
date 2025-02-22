from sklearn import datasets
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
from flask import Flask, request, jsonify

# Step 1: Train the Logistic Regression Model
# Load the Iris dataset
iris = datasets.load_iris()
X = iris.data
y = iris.target

# Split dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train the logistic regression model
log_reg_model = LogisticRegression(max_iter=200)
log_reg_model.fit(X_train, y_train)

# Step 2: Print the accuracy of the model
y_pred = log_reg_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f'Accuracy of the Logistic Regression Model: {accuracy * 100:.2f}%')

# Step 3: Save the trained model
joblib.dump(log_reg_model, 'log_reg_model.pkl')  # Save model as .pkl file

# Step 4: Create Flask API to serve the model for predictions
app = Flask(__name__)

# Load the trained model (this is for use within the Flask API)
log_reg_model = joblib.load('log_reg_model.pkl')  # Load the saved model
svm_model = joblib.load('svm_model.pkl')  # Load your pre-trained SVM model
#random_model = joblib.load('"C:\Users\DELL\Desktop\2nd_sem\Decentralization\TD3\random.pkl"')  # Load your pre-trained Random Forest model
decision_tree_model = joblib.load('decision_tree_model.pkl')  # Load your pre-trained Decision Tree model

@app.route('/predict', methods=['GET'])
def predict():
    try:
        # Get input features as query parameters
        features = request.args.getlist('features', type=float)

        # Check if the correct number of features are passed (4 features for Iris dataset)
        if len(features) != 4:
            return jsonify({"error": "Please provide exactly 4 features."})

        # Predict using each model
        log_reg_pred = log_reg_model.predict([features])
        svm_pred = svm_model.predict([features])
        #random_pred = random_model.predict([features])
        decision_tree_pred = decision_tree_model.predict([features])

        # Combine predictions (you can choose how to aggregate them)
        # Example: Majority vote
        predictions = [log_reg_pred[0], svm_pred[0], decision_tree_pred[0]]
        final_prediction = max(set(predictions), key=predictions.count)

        # Map the prediction to the corresponding class label (0: Setosa, 1: Versicolor, 2: Virginica)
        class_names = ['Setosa', 'Versicolor', 'Virginica']
        predicted_class = class_names[final_prediction]

        # Print the predicted class for debugging
        print(f"Predicted class: {predicted_class}")

        # Return the prediction as a JSON response
        return jsonify({'prediction': predicted_class})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
