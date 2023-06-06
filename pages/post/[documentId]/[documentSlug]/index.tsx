import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import sharedGetStaticProps from "~/components/Document/lib/sharedGetStaticProps";
import DocumentPageLayout from "~/components/Document/pages/DocumentPageLayout";
import { useRouter } from "next/router";
import getDocumentFromRaw, {
  DocumentType,
  GenericDocument,
  Post,
  isPaper,
  isPost,
} from "~/components/Document/lib/types";
import { captureEvent } from "~/config/utils/events";
import Error from "next/error";
import PDFViewer from "~/components/Document/lib/PDFViewer/PDFViewer";
import config from "~/components/Document/lib/config";
import { StyleSheet, css } from "aphrodite";
import PaperPageAbstractSection from "~/components/Paper/abstract/PaperPageAbstractSection";
import DocumentPagePlaceholder from "~/components/Document/lib/Placeholders/DocumentPagePlaceholder";
import { useState } from "react";
import useDocumentMetadata from "~/components/Document/lib/useDocumentMetadata";
import { DocumentContext } from "~/components/Document/lib/DocumentContext";

interface Args {
  documentData?: any;
  postHtml?: TrustedHTML | string;
  errorCode?: number;
}

const DocumentIndexPage: NextPage<Args> = ({
  documentData,
  postHtml = "",
  errorCode,
}) => {
  const documentType = "post";
  const router = useRouter();
  const [viewerWidth, setViewerWidth] = useState<number | undefined>(config.maxWidth);
  const [metadata, updateMetadata] = useDocumentMetadata({ id: documentData?.unified_document?.id });

  if (router.isFallback) {
    return <DocumentPagePlaceholder />;
  }
  if (errorCode) {
    return <Error statusCode={errorCode} />;
  }

  let document: Post;
  try {
    document = getDocumentFromRaw({ raw: documentData, type: documentType }) as Post;
  } catch (error: any) {
    captureEvent({
      error,
      msg: "[Document] Could not parse",
      data: { documentData, documentType },
    });
    return <Error statusCode={500} />;
  }

  return (
    <DocumentContext.Provider value={{ metadata, documentType, updateMetadata }}>
      <DocumentPageLayout
        document={document}
        errorCode={errorCode}
        metadata={metadata}
        documentType={documentType}
      >
        <div className={css(styles.bodyContentWrapper)} style={{ width: viewerWidth }}>
          <div className={css(styles.bodyWrapper)}>
            <div
              className={css(styles.body) + " rh-post"}
              dangerouslySetInnerHTML={{ __html: postHtml }}
            />
          </div>
        </div>
      </DocumentPageLayout>
    </DocumentContext.Provider>
  );
};

const styles = StyleSheet.create({
  bodyWrapper: {
    borderRadius: "4px",
    border: `1px solid ${config.border}`,
    marginTop: 15,
    background: "white",
    width: "100%",
    boxSizing: "border-box",
  },
  body: {
    padding: 45,
  },
  bodyContentWrapper: {
    margin: "0 auto",
  },  
});

export const getStaticProps: GetStaticProps = async (ctx) => {
  return sharedGetStaticProps({ ctx, documentType: "post" });
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export default DocumentIndexPage;
