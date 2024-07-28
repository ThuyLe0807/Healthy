import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, FlatList, Modal, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [content, setContent] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewContent, setViewContent] = useState('');

  const handleSavePost = useCallback(async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền nội dung.');
      return;
    }

    try {
      const postRef = firestore().collection('posts');
      if (isEditing) {
        await postRef.doc(currentId).update({
          content,
          createAt: firestore.FieldValue.serverTimestamp(),
        });
        Alert.alert('Thành công', 'Đã cập nhật dữ liệu thành công.');
      } else {
        await postRef.add({
          content,
          createAt: firestore.FieldValue.serverTimestamp(),
        });
        Alert.alert('Thành công', 'Đã thêm dữ liệu thành công.');
      }
      resetState();
      fetchData();
    } catch (error) {
      console.error('Error saving post: ', error);
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu.');
    }
  }, [content, isEditing, currentId]);

  const handleDeletePost = useCallback(async (id) => {
    try {
      await firestore().collection('posts').doc(id).delete();
      Alert.alert('Thành công', 'Đã xoá dữ liệu thành công.');
      fetchData();
    } catch (error) {
      console.error('Error deleting post: ', error);
      Alert.alert('Lỗi', 'Không thể xoá dữ liệu.');
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const postCollections = await firestore().collection('posts').orderBy('createAt', 'desc').get();
      const postData = postCollections.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createAt: doc.data().createAt ? doc.data().createAt.toDate().toLocaleDateString() : 'Unknown',
      }));
      setData(postData);
    } catch (error) {
      console.error('Error fetching posts: ', error);
    }
  }, []);

  const resetState = () => {
    setModalVisible(false);
    setContent('');
    setIsEditing(false);
    setCurrentId(null);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View>
        <Text style={styles.itemTitle}>{item.createAt}</Text>
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={styles.itemContent}
          onPress={() => {
            setViewContent(item.content);
            setViewModalVisible(true);
          }}
        >
          {item.content}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => {
            setIsEditing(true);
            setCurrentId(item.id);
            setContent(item.content);
            setModalVisible(true);
          }}
        >
          <Icon name="edit" size={24} color="#000" style={styles.itemIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
          <Icon name="delete" size={24} color="#000" style={styles.itemIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#E0F7FA' }}>
      <ScrollView style={{ margin: 15 }}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </ScrollView>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
        <Icon name="add" size={40} color="#fff" />
      </TouchableOpacity>

      {/* ADD & UPDATE MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetState}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{isEditing ? 'Edit Post' : 'Add New Post'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Content"
              value={content}
              onChangeText={setContent}
              multiline={true}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSavePost}>
                <Icon name="check" size={25} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#00796B' }]} onPress={resetState}>
                <Icon name="cancel" size={25} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={viewModalVisible}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Xem nội dung</Text>
            <ScrollView style={styles.viewContent}>
              <Text style={styles.fullContentText}>{viewContent}</Text>
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#00796B' }]} onPress={() => setViewModalVisible(false)}>
              <Icon name="cancel" size={25} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingLeft: 16,
    marginVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  itemContent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00796B',
    width: 250,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemIcon: {
    marginHorizontal: 8,
  },
  button: {
    width: 70,
    height: 70,
    backgroundColor: '#00796B',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 85,
    right: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: 180,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalButton: {
    backgroundColor: '#00796B',
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  viewContent: {
    width: '100%',
    height: 180,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  fullContentText: {
    fontSize: 16,
    color: '#000'
  },
});

export default HomeScreen;
