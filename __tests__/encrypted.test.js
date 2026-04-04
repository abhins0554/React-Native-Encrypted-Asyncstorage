import {
  Set_Encrypted_AsyncStorage,
  Get_Encrypted_AsyncStorage,
  Remove_Encrypted_AsyncStorage,
} from "../index.js";
import { __resetMockStorage } from "../test/mocks/async-storage.js";

const KEY = "secret-key";

beforeEach(() => {
  __resetMockStorage();
});

describe("Set_Encrypted_AsyncStorage / Get_Encrypted_AsyncStorage", () => {
  it("round-trips text", async () => {
    await Set_Encrypted_AsyncStorage("text", "k1", "hello", KEY);
    expect(await Get_Encrypted_AsyncStorage("text", "k1", KEY)).toBe("hello");
  });

  it("returns true on set for text and object", async () => {
    await expect(
      Set_Encrypted_AsyncStorage("text", "a", "x", KEY)
    ).resolves.toBe(true);
    await expect(
      Set_Encrypted_AsyncStorage("object", "b", { x: 1 }, KEY)
    ).resolves.toBe(true);
  });

  it("round-trips object", async () => {
    const obj = { a: 1, nested: { b: "c" } };
    await Set_Encrypted_AsyncStorage("object", "k2", obj, KEY);
    expect(await Get_Encrypted_AsyncStorage("object", "k2", KEY)).toEqual(obj);
  });

  it("returns null when key missing", async () => {
    expect(await Get_Encrypted_AsyncStorage("text", "missing", KEY)).toBeNull();
  });

  it("returns undefined for invalid type (backward compatible)", async () => {
    await expect(
      Set_Encrypted_AsyncStorage("bad", "k", "v", KEY)
    ).resolves.toBeUndefined();
    await expect(
      Get_Encrypted_AsyncStorage("bad", "k", KEY)
    ).resolves.toBeUndefined();
  });

  it("returns null for object type when ciphertext cannot be parsed as JSON", async () => {
    await Set_Encrypted_AsyncStorage("text", "k3", "not-json", KEY);
    expect(await Get_Encrypted_AsyncStorage("object", "k3", KEY)).toBeNull();
  });

  it("returns null for object type when wrong encryption key", async () => {
    await Set_Encrypted_AsyncStorage("object", "k4", { x: 1 }, KEY);
    expect(await Get_Encrypted_AsyncStorage("object", "k4", "wrong-key")).toBeNull();
  });
});

describe("storageFormat v2", () => {
  it("round-trips text and object with PBKDF2+HMAC format", async () => {
    await Set_Encrypted_AsyncStorage("text", "v2t", "hello", KEY, {
      storageFormat: "v2",
    });
    expect(await Get_Encrypted_AsyncStorage("text", "v2t", KEY)).toBe("hello");

    const obj = { a: 1 };
    await Set_Encrypted_AsyncStorage("object", "v2o", obj, KEY, {
      storageFormat: "v2",
    });
    expect(await Get_Encrypted_AsyncStorage("object", "v2o", KEY)).toEqual(obj);
  });

  it("returns null when v2 key is wrong (MAC fails)", async () => {
    await Set_Encrypted_AsyncStorage("object", "v2w", { x: 1 }, KEY, {
      storageFormat: "v2",
    });
    expect(
      await Get_Encrypted_AsyncStorage("object", "v2w", "wrong-key")
    ).toBeNull();
  });

  it("reads legacy payloads after writing v2 on same key pattern", async () => {
    await Set_Encrypted_AsyncStorage("text", "mix", "legacy", KEY);
    expect(await Get_Encrypted_AsyncStorage("text", "mix", KEY)).toBe("legacy");
  });
});

describe("Remove_Encrypted_AsyncStorage", () => {
  it("removes stored value", async () => {
    await Set_Encrypted_AsyncStorage("text", "rk", "v", KEY);
    await Remove_Encrypted_AsyncStorage("rk");
    expect(await Get_Encrypted_AsyncStorage("text", "rk", KEY)).toBeNull();
  });
});
