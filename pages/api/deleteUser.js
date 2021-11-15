import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.type,
      project_id: process.env.project_id,
      private_key_id: process.env.private_key_id,
      private_key: process.env.private_key,
      client_email: process.env.client_email,
      client_id: process.env.client_id,
      auth_uri: process.env.auth_uri,
      token_uri: process.env.token_uri,
      auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
      client_x509_cert_url: process.env.client_x509_cert_url,
    }),
  });
}

export default async (req, res) => {
  const { uid } = req.query;

  const db = admin.firestore();

  const userRef = db.collection('users').doc(uid);

  const doc = await userRef.get();
  const { joinGroup } = doc.data();

  const groupDoc = await db.collection('groups').doc(joinGroup).get();
  const { totalParticipants } = groupDoc.data();

  const proms = [];
  if (totalParticipants === 1) {
    proms.push(db.collection('groups').doc(groupDoc.id).delete());
  } else {
    proms.push(db.collection('groups').doc(groupDoc.id).collection('participants').doc(uid)
      .delete());
    proms.push(db.collection('groups').doc(groupDoc.id).update({
      totalParticipants: admin.firestore.FieldValue.increment(-1),
    }));
  }

  await Promise.all([
    ...proms,
    userRef.delete(),
    admin.auth().deleteUser(uid),
  ]);

  return res.status(200).json({ success: true });
};
