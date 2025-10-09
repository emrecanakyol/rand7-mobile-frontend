// 🔹 Firestore timestamp'tan yaş hesapla
export const calculateAge = (birthDate: any) => {
    if (!birthDate) return "";

    // Firestore Timestamp ise:
    const date =
        typeof birthDate.toDate === "function"
            ? birthDate.toDate()
            : new Date(birthDate);

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
    }

    return age;
};
