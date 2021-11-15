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
  const { uid, groupId } = req.query;

  const db = admin.firestore();

  const userRef = db.collection('users').doc(uid);
  const groupRef = db.collection('groups').doc(groupId);
  const participantsRef = groupRef.collection('participants').doc(uid);

  const { exists } = await groupRef.get();

  const proms = [
    userRef.update({ joinGroup: '' }),
  ];

  if (exists) {
    proms.push(groupRef.update({ totalParticipants: admin.firestore.FieldValue.increment(-1) }));
    proms.push(participantsRef.delete());
  }

  await Promise.all(proms);

  return res.status(200).json({ success: true });
};
