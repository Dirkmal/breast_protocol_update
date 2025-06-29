<?php

class Patient {
    private PDO $pdo;
    private $table = "patients";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create a new patient
    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (hospitalNumber, firstName, lastName, dateOfBirth, gender, contactNumber, insurance_provider, insurance_number, email, address, bloodGroup, medicalHistory, createdBy, createdAt, updatedAt) 
                  VALUES 
                  (:hospitalNumber, :firstName, :lastName, :dateOfBirth, :gender, :contactNumber, :insurance_provider, :insurance_number, :email, :address, :bloodGroup, :medicalHistory, :createdBy, :createdAt, :updatedAt)";
        
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':hospitalNumber', $data['hospitalNumber']);
        $stmt->bindParam(':firstName', $data['firstName']);
        $stmt->bindParam(':lastName', $data['lastName']);
        $stmt->bindParam(':dateOfBirth', $data['dateOfBirth']);
        $stmt->bindParam(':gender', $data['gender']);
        $stmt->bindParam(':contactNumber', $data['contactNumber']);
        $stmt->bindParam(':insurance_provider', $data['insurance_provider']);
        $stmt->bindParam(':insurance_number', $data['insurance_number']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':bloodGroup', $data['bloodGroup']);
        $stmt->bindParam(':medicalHistory', $data['medicalHistory']);
        $stmt->bindParam(':createdBy', $data['createdBy']);
        $stmt->bindParam(':createdAt', $data['createdAt']);
        $stmt->bindParam(':updatedAt', $data['updatedAt']);

        return $stmt->execute();
    }

    // Read all patients
    public function read() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Read a single patient by ID
    public function readSingle($id) {
        $limit = isset($_GET['page_size']) ? (int)$_GET['page_size'] : 10;
        $offset = isset($_GET['page']) ? (int)$_GET['page'] : 0;
    
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Update a patient
    public function update($id, $data) {
        $query = "UPDATE " . $this->table . " 
                  SET hospitalNumber = :hospitalNumber, firstName = :firstName, lastName = :lastName, dateOfBirth = :dateOfBirth, gender = :gender, contactNumber = :contactNumber, insurance_provider = :insurance_provider, insurance_number = :insurance_number, email = :email, address = :address, bloodGroup = :bloodGroup, medicalHistory = :medicalHistory, createdBy = :createdBy, updatedAt = :updatedAt 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':hospitalNumber', $data['hospitalNumber']);
        $stmt->bindParam(':firstName', $data['firstName']);
        $stmt->bindParam(':lastName', $data['lastName']);
        $stmt->bindParam(':dateOfBirth', $data['dateOfBirth']);
        $stmt->bindParam(':gender', $data['gender']);
        $stmt->bindParam(':contactNumber', $data['contactNumber']);
        $stmt->bindParam(':insurance_provider', $data['insurance_provider']);
        $stmt->bindParam(':insurance_number', $data['insurance_number']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':bloodGroup', $data['bloodGroup']);
        $stmt->bindParam(':medicalHistory', $data['medicalHistory']);
        $stmt->bindParam(':createdBy', $data['createdBy']);
        $stmt->bindParam(':updatedAt', $data['updatedAt']);
        $stmt->bindParam(':id', $id);

        return $stmt->execute();
    }

    // Delete a patient
    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}

?>