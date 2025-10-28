"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ThProps } from "@/components/table/Th";
import ThTr from "@/components/table/ThTr";
import TdTr from "@/components/table/TdTr";
import { Special } from "@/types/types";
import { useToast } from "@/components/ui/Toast";
import InputText from "@/components/ui/InputText";

const TITLE = `특수 연차 관리`;

export default function ManageSpecialPage() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [special, setSpecial] = useState<Special[] | null>(null);
  const { showToast } = useToast();
  const initialNewSpecialData: Special = {
    name: ``,
    num: ``,
  };
  const [newSpecialData, setNewSpecialData] = useState<Special>(
    initialNewSpecialData
  );

  const onRenderModalContent = () => {
    const columns: ThProps[] = [
      { key: `title`, label: `이름`, width: `w-[140px]` },
      { key: `node`, label: `갯수`, width: `flex-1` },
    ];

    const rows = [
      [
        { key: `title`, content: `이름` },
        {
          key: `node`,
          content: (
            <InputText
              value={newSpecialData.name}
              onChangeValue={(value) => onChangeNewSpecialData("name", value)}
            />
          ),
        },
      ],
      [
        { key: `title`, content: `갯수` },
        {
          key: `node`,
          content: (
            <InputText
              value={newSpecialData.num}
              onChangeValue={(value) => onChangeNewSpecialData("num", value)}
            />
          ),
        },
      ],
    ];
    return (
      <TableContainer className="w-full border-neutral-300">
        <thead>
          <ThTr columns={columns} className={cn(styles.th)} />
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <TdTr key={i} columns={columns} row={row} />
          ))}
        </tbody>
      </TableContainer>
    );
  };

  function onChangeNewSpecialData(key: string, value: string) {
    setNewSpecialData((prev) => ({ ...prev, [key]: value }));
  }

  async function fetchSpecial() {
    const { data, error } = await supabase.from("special").select("*");

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      setSpecial(data ?? null);
    }
  }

  async function deleteSpecial(id: number) {
    if (!id) return;
    const { error } = await supabase
      .from("special")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("삭제 오류:", error.message);
      return;
    }
    setSpecial((prev) => (prev ? prev.filter((item) => item.id !== id) : prev));
    showToast("삭제 되었습니다.");
  }

  async function registerNewSpecial(newSpecialData: Special) {
    const payload = {
      name: newSpecialData.name,
      num: Number(newSpecialData.num),
    };

    const { error } = await supabase.from("special").insert(payload);
    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      fetchSpecial();
      setIsOpen(false);
      showToast("등록 되었습니다.");
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchSpecial();
    }
  }, [user]);

  function onClickDeleteButton(id: number) {
    deleteSpecial(id);
  }

  const columns: ThProps[] = [
    { key: `no`, label: `No`, width: `w-[120px]` },
    { key: `name`, label: `이름`, width: `flex-1` },
    { key: `num`, label: `갯수`, width: `flex-1` },
    { key: `del`, label: `삭제`, width: `w-[200px]` },
  ];

  function onMakeRow(special: Special[] | null) {
    if (!special) {
      return;
    } else {
      return special.map((item, idx) => {
        const row = [
          { key: `no`, content: idx + 1 },
          { key: `name`, content: item.name },
          { key: `num`, content: item.num },
          {
            key: `del`,
            content: (
              <Button
                variant="red"
                text="삭제"
                onClick={() => {
                  onClickDeleteButton(item?.id || 0);
                }}
              />
            ),
          },
        ];

        return <TdTr key={item.id} columns={columns} row={row} />;
      });
    }
  }

  const styles = {
    ctn: `my-[80px] flex flex-col gap-[34px] w-[1600px]`,
    buttonCtn: `w-full flex justify-center`,
    th: `hidden`,
    modalBtn: `px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all`,
  };

  function onClickRegisterNewButton() {
    setIsOpen(true);
  }

  function onRegisterNew() {
    registerNewSpecial(newSpecialData);
  }

  if (!special) return <LoadingSpinner />;

  return (
    <>
      <PageContainer className={cn(styles.ctn)}>
        <PageTitle title={TITLE} type="big" />
        <TableContainer>
          <thead>
            <ThTr columns={columns} />
          </thead>
          <tbody>{onMakeRow(special)}</tbody>
        </TableContainer>
        <div className={cn(styles.buttonCtn)}>
          <Button
            variant="blue"
            text="신규 등록하기"
            onClick={onClickRegisterNewButton}
            className="w-[200px]"
          />
        </div>
      </PageContainer>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="특수 연차 등록"
        actions={
          <>
            <Button
              variant="blue"
              text="등록"
              onClick={onRegisterNew}
              className="px-[46px] py-[14px]"
            />
          </>
        }
      >
        {onRenderModalContent()}
      </Modal>
    </>
  );
}
